import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.gridlayer.googlemutant'
import {
  Building2,
  MapPin,
  Upload,
  Image as ImageIcon,
  X,
  Loader2
} from 'lucide-react'
import { useOrganizationStore } from '../stores/organizationStore'
import { electronAPI } from '../utils/electronAPI'
import toast from 'react-hot-toast'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MAP_PROVIDER = import.meta.env.VITE_MAP_PROVIDER || 'google'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC2dz15lOn8v9mFHT6YQ8bSi85WqRaK6oA'

export const OrganizationSettings = () => {
  const { currentOrganization, setCurrentOrganization } = useOrganizationStore()
  const [activeTab, setActiveTab] = useState('location')
  const [logoPreview, setLogoPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Load Google Maps API if needed
  useEffect(() => {
    if (MAP_PROVIDER !== 'google' || mapReady) return

    if (window.google && window.google.maps) {
      setMapReady(true)
      return
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)
    if (existingScript) {
      if (existingScript.onload === null) {
        existingScript.onload = () => setMapReady(true)
      }
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => setMapReady(true)
    script.onerror = () => console.error('Failed to load Google Maps')
    document.head.appendChild(script)
  }, [])

  // Initialize map - only when location tab is active
  useEffect(() => {
    if (!mapRef.current || activeTab !== 'location' || (MAP_PROVIDER === 'google' && !mapReady)) return

    if (!mapInstanceRef.current) {
      const lat = parseFloat(currentOrganization?.latitude) || 39.7392
      const lng = parseFloat(currentOrganization?.longitude) || -104.9903

      mapInstanceRef.current = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        worldCopyJump: false,
        preferCanvas: false,
      })

      if (MAP_PROVIDER === 'google' && L.gridLayer && L.gridLayer.googleMutant) {
        L.gridLayer.googleMutant({
          type: 'roadmap',
          maxZoom: 20,
        }).addTo(mapInstanceRef.current)
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current)
      }

      setTimeout(() => {
        if (mapInstanceRef.current && mapRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 100)
    }

    const map = mapInstanceRef.current
    if (!map) return

    // Invalidate size when tab becomes active
    if (activeTab === 'location') {
      setTimeout(() => {
        if (mapInstanceRef.current && mapRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 100)
    }
  }, [mapReady, activeTab])

  // Handle marker updates when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || activeTab !== 'location') return

    const map = mapInstanceRef.current
    const lat = parseFloat(currentOrganization?.latitude) || 39.7392
    const lng = parseFloat(currentOrganization?.longitude) || -104.9903

    // Clear existing marker
    if (markerRef.current) {
      markerRef.current.remove()
    }

    // Add draggable marker
    markerRef.current = L.marker([lat, lng], {
      draggable: true,
    }).addTo(map)

    markerRef.current.on('dragend', (e) => {
      const newLatLng = e.target.getLatLng()
      setCurrentOrganization({
        ...currentOrganization,
        latitude: newLatLng.lat.toString(),
        longitude: newLatLng.lng.toString()
      })
    })

    // Use setView instead of fitBounds for a single point
    map.setView([lat, lng], map.getZoom() > 13 ? map.getZoom() : 13)
  }, [mapReady, currentOrganization?.latitude, currentOrganization?.longitude, activeTab])

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
      // Convert to base64 for storage
      const base64 = reader.result
      setCurrentOrganization({
        ...currentOrganization,
        logoUrl: base64
      })
      toast.success('Logo uploaded successfully!')
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please drop an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
      setCurrentOrganization({
        ...currentOrganization,
        logoUrl: reader.result
      })
      toast.success('Logo uploaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await setCurrentOrganization(currentOrganization)
      toast.success('Organization settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save organization settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUseCurrentLocation = async () => {
    try {
      const location = await electronAPI.getCurrentLocation()
      setCurrentOrganization({
        ...currentOrganization,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString()
      })
      toast.success('Location updated!')
    } catch (error) {
      console.error('Failed to get current location:', error)
      toast.error('Failed to get current location')
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setCurrentOrganization({
      ...currentOrganization,
      logoUrl: ''
    })
  }

  // Load logo preview from organization
  useEffect(() => {
    if (currentOrganization?.logoUrl) {
      setLogoPreview(currentOrganization.logoUrl)
    }
  }, [currentOrganization?.logoUrl])

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Organization Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your organization details and location
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'details'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Organization Details
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'location'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Location & Map
        </button>
      </div>

      {/* Tab Content */}
      <div className="card shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Organization Name */}
              <div>
                <label className="label mb-2">Organization Name *</label>
                <input
                  type="text"
                  className="input"
                  value={currentOrganization?.name || ''}
                  onChange={(e) => setCurrentOrganization({ ...currentOrganization, name: e.target.value })}
                  placeholder="Enter organization name"
                />
              </div>

              {/* Logo Upload with Preview */}
              <div>
                <label className="label mb-2">Organization Logo</label>
                
                {logoPreview ? (
                  <div className="relative inline-block">
                    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 max-w-xs">
                      <img 
                        src={logoPreview} 
                        alt="Organization Logo" 
                        className="w-full h-auto max-h-48 object-contain rounded-lg"
                      />
                    </div>
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 w-full btn btn-secondary flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Change Logo
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Drop your logo here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Address Fields */}
              <div>
                <label className="label mb-2">Street Address</label>
                <input
                  type="text"
                  className="input"
                  value={currentOrganization?.streetAddress || ''}
                  onChange={(e) => setCurrentOrganization({ ...currentOrganization, streetAddress: e.target.value })}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label mb-2">City</label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.city || ''}
                    onChange={(e) => setCurrentOrganization({ ...currentOrganization, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="label mb-2">State</label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.state || ''}
                    onChange={(e) => setCurrentOrganization({ ...currentOrganization, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="label mb-2">Postal Code</label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.postalCode || ''}
                    onChange={(e) => setCurrentOrganization({ ...currentOrganization, postalCode: e.target.value })}
                    placeholder="Enter postal code"
                  />
                </div>

                <div>
                  <label className="label mb-2">Country</label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.country || ''}
                    onChange={(e) => setCurrentOrganization({ ...currentOrganization, country: e.target.value })}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-6">
              {/* Map */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Organization Location</label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="btn btn-secondary btn-sm flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Use Current Location
                  </button>
                </div>
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
                  style={{ minHeight: '384px' }}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Drag the marker to set your organization location
                </p>
              </div>

              {/* Coordinates Display */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label mb-2">Latitude</label>
                  <input
                    type="number"
                    className="input"
                    value={currentOrganization?.latitude || ''}
                    onChange={(e) => setCurrentOrganization({ ...currentOrganization, latitude: e.target.value })}
                    placeholder="Enter latitude"
                    step="0.000001"
                  />
                </div>

                <div>
                  <label className="label mb-2">Longitude</label>
                  <input
                    type="number"
                    className="input"
                    value={currentOrganization?.longitude || ''}
                    onChange={(e) => setCurrentOrganization({ ...currentOrganization, longitude: e.target.value })}
                    placeholder="Enter longitude"
                    step="0.000001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Organization Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

