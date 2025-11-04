import React, { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.gridlayer.googlemutant'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Get map provider from environment variable
const MAP_PROVIDER = import.meta.env.VITE_MAP_PROVIDER || 'google'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC2dz15lOn8v9mFHT6YQ8bSi85WqRaK6oA'

export const LiveMap = ({ selectedGeofence, geofences = [], onMapClick, isEditMode = false, onGeofenceUpdate, editFormData, onEditClick, onFormDataUpdate, onRightClick }) => {
  // Determine provider: if no prop provided, use env or default to Google
  const envProvider = import.meta.env.VITE_MAP_PROVIDER
  const useGoogleMap = useMemo(() => (envProvider || 'google') === 'google', [envProvider])
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const geofenceLayersRef = useRef([])
  const mapClickHandlerRef = useRef(null)
  const mapRightClickHandlerRef = useRef(null)
  const circleMarkersRef = useRef({})
  const polygonMarkersRef = useRef([])
  const polygonShapeRef = useRef(null)
  const formEditMarkerRef = useRef(null)
  const formRadiusHandleRef = useRef(null)
  const formCircleRef = useRef(null)
  const tileLayerRef = useRef(null)
  
  // Store callbacks in refs to avoid dependency issues
  const onGeofenceUpdateRef = useRef(onGeofenceUpdate)
  const onMapClickRef = useRef(onMapClick)
  const onEditClickRef = useRef(onEditClick)
  const onFormDataUpdateRef = useRef(onFormDataUpdate)
  const onRightClickRef = useRef(onRightClick)

  // Update callback refs when they change
  useEffect(() => {
    onGeofenceUpdateRef.current = onGeofenceUpdate
    onMapClickRef.current = onMapClick
    onEditClickRef.current = onEditClick
    onFormDataUpdateRef.current = onFormDataUpdate
    onRightClickRef.current = onRightClick
  }, [onGeofenceUpdate, onMapClick, onEditClick, onFormDataUpdate, onRightClick])

  // Load Google Maps API if using Google provider
  useEffect(() => {
    // Determine provider: prop takes precedence over env
    const provider = useGoogleMap ? 'google' : 'openstreetmap'
    
    if (provider === 'google') {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setMapReady(true)
        return
      }

      // Check if script tag already exists
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)
      if (existingScript) {
        // Wait for existing script to load
        if (existingScript.onload === null) {
          existingScript.onload = () => setMapReady(true)
        }
        return
      }

      // Load Google Maps script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapReady(true)
      }
      script.onerror = (error) => {
        console.error('Failed to load Google Maps:', error)
      }
      document.head.appendChild(script)
    } else {
      // No Google Maps API needed for OpenStreetMap
      setMapReady(true)
    }
  }, [useGoogleMap])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return
    
    // Determine provider: prop takes precedence over env
    const provider = useGoogleMap ? 'google' : 'openstreetmap'
    
    if (provider === 'google' && !mapReady) return

    // Initialize Leaflet map if not already initialized
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [39.7392, -104.9903], // Default center (Denver)
        zoom: 13,
        zoomControl: true,
        worldCopyJump: false,
        preferCanvas: false,
      })

      // Add tile layer based on provider
      if (provider === 'google' && L.gridLayer && L.gridLayer.googleMutant) {
        // Use Google Maps tiles with Leaflet using GoogleMutant
        tileLayerRef.current = L.gridLayer.googleMutant({
          type: 'roadmap',
          maxZoom: 20,
        }).addTo(mapInstanceRef.current)
      } else {
        // Use OpenStreetMap tiles
        tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current)
      }
      
      // Force map to invalidate size to fix any layout issues
      setTimeout(() => {
        if (mapInstanceRef.current && mapRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 100)
    }

    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers and geofence layers
    markersRef.current.forEach(marker => marker.remove())
    geofenceLayersRef.current.forEach(layer => layer.remove())
    Object.values(circleMarkersRef.current).forEach(marker => marker.remove())
    
    // Clear polygon drawing markers and shape if not actively in polygon edit mode
    if (!(editFormData && editFormData.type === 'polygon')) {
      polygonMarkersRef.current.forEach(marker => marker.remove())
      if (polygonShapeRef.current) {
        polygonShapeRef.current.remove()
      }
    }
    
    markersRef.current = []
    geofenceLayersRef.current = []
    circleMarkersRef.current = {}

    // Draw all geofences
    geofences.forEach(geofence => {
      if (!geofence.enabled && geofence.enabled !== undefined) return

      const isSelected = selectedGeofence?.id === geofence.id
      const color = isSelected ? '#3b82f6' : geofence.type === 'circle' ? '#60a5fa' : '#34d399'
      const weight = isSelected ? 3 : 2

      if (geofence.type === 'circle' && geofence.center && geofence.radius) {
        // Draw circle geofence
        const circle = L.circle([geofence.center.lat, geofence.center.lng], {
          radius: geofence.radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: weight,
        }).addTo(map)

        geofenceLayersRef.current.push(circle)

        // Add marker at center - make draggable if selected
        const marker = L.marker([geofence.center.lat, geofence.center.lng], {
          title: geofence.name,
          draggable: isSelected && editFormData !== null,
        })
          .addTo(map)
        
        // Bind popup with edit link
        const popupContent = L.DomUtil.create('div', 'text-sm')
        popupContent.innerHTML = `
          <strong>${geofence.name}</strong><br/>
          <span style="color: ${geofence.enabled !== false ? 'green' : 'red'}">
            ${geofence.enabled !== false ? '● Active' : '● Inactive'}
          </span>
          <br/><br/>
          <a href="#" class="edit-link" style="color: blue; text-decoration: underline; cursor: pointer;">Edit</a>
        `
        marker.bindPopup(popupContent)
        
        // Handle edit link click
        popupContent.querySelector('.edit-link').addEventListener('click', (e) => {
          e.preventDefault()
          if (onEditClickRef.current) {
            onEditClickRef.current(geofence)
          }
        })

        // Handle marker drag
        if (isSelected && editFormData !== null) {
          marker.on('dragend', (e) => {
            const newCenter = e.target.getLatLng()
            if (onGeofenceUpdateRef.current && geofence.id) {
              onGeofenceUpdateRef.current(geofence.id, {
                center: { lat: newCenter.lat, lng: newCenter.lng }
              })
            }
          })
        }

        markersRef.current.push(marker)

        // Add radius handle for selected circles in edit mode
        if (isSelected && editFormData !== null && geofence.radius) {
          const startLat = geofence.center.lat
          const startLng = geofence.center.lng
          // Calculate point at radius distance north from center
          const radiusHandleLat = startLat + (geofence.radius / 111320) // Convert meters to degrees
          const radiusHandleLng = startLng
          
          const radiusMarker = L.marker([radiusHandleLat, radiusHandleLng], {
            draggable: true,
            icon: L.divIcon({
              className: 'radius-handle',
              html: '<div style="width: 12px; height: 12px; background: red; border: 2px solid white; border-radius: 50%;"></div>',
              iconSize: [12, 12],
            })
          }).addTo(map)

          radiusMarker.on('dragend', (e) => {
            const handlePos = e.target.getLatLng()
            const centerLat = geofence.center.lat
            const centerLng = geofence.center.lng
            
            // Calculate new radius using Leaflet's distance method
            const newRadius = map.distance(
              L.latLng(centerLat, centerLng),
              handlePos
            )
            
            if (onGeofenceUpdateRef.current && geofence.id) {
              onGeofenceUpdateRef.current(geofence.id, {
                radius: newRadius
              })
            }
          })

          circleMarkersRef.current[geofence.id] = radiusMarker
        }
      } else if (geofence.type === 'polygon' && geofence.coordinates && geofence.coordinates.length > 0) {
        // Skip drawing if this polygon is being edited (handled by polygon editing mode)
        const isBeingEdited = isSelected && editFormData && editFormData.type === 'polygon'
        
        if (!isBeingEdited) {
          // Draw polygon geofence
          const coordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng])
          
          const polygon = L.polygon(coordinates, {
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            weight: weight,
          }).addTo(map)

          geofenceLayersRef.current.push(polygon)

          // Add marker at center of polygon
          const bounds = polygon.getBounds()
          const center = bounds.getCenter()
          
          const marker = L.marker(center, {
            title: geofence.name,
          })
            .addTo(map)
          
          // Bind popup with edit link
          const popupContent = L.DomUtil.create('div', 'text-sm')
          popupContent.innerHTML = `
            <strong>${geofence.name}</strong><br/>
            <span style="color: ${geofence.enabled !== false ? 'green' : 'red'}">
              ${geofence.enabled !== false ? '● Active' : '● Inactive'}
            </span>
            <br/><br/>
            <a href="#" class="edit-link" style="color: blue; text-decoration: underline; cursor: pointer;">Edit</a>
          `
          marker.bindPopup(popupContent)
          
          // Handle edit link click
          popupContent.querySelector('.edit-link').addEventListener('click', (e) => {
            e.preventDefault()
            if (onEditClickRef.current) {
              onEditClickRef.current(geofence)
            }
          })

          markersRef.current.push(marker)
        }
      }
    })

    // Fit bounds to show all geofences if there are any
    if (geofences.length > 0 && geofenceLayersRef.current.length > 0) {
      const group = new L.featureGroup(geofenceLayersRef.current)
      map.fitBounds(group.getBounds().pad(0.2))
    }

    // If selected geofence exists, center on it
    if (selectedGeofence) {
      if (selectedGeofence.type === 'circle' && selectedGeofence.center) {
        map.setView([selectedGeofence.center.lat, selectedGeofence.center.lng], 14)
      } else if (selectedGeofence.type === 'polygon' && selectedGeofence.coordinates && selectedGeofence.coordinates.length > 0) {
        const bounds = L.polygon(selectedGeofence.coordinates.map(coord => [coord.lat, coord.lng])).getBounds()
        map.fitBounds(bounds)
      }
    }

    return () => {
      // Cleanup on unmount only
    }
  }, [selectedGeofence, geofences, editFormData, useGoogleMap, mapReady])

  // Handle edit mode toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    if (isEditMode && onMapClickRef.current) {
      // Add click handler
      mapClickHandlerRef.current = (e) => {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng)
      }
      map.on('click', mapClickHandlerRef.current)
    } else {
      // Remove click handler
      if (mapClickHandlerRef.current) {
        map.off('click', mapClickHandlerRef.current)
        mapClickHandlerRef.current = null
      }
    }

    return () => {
      // Cleanup click handler
      if (map && mapClickHandlerRef.current) {
        map.off('click', mapClickHandlerRef.current)
        mapClickHandlerRef.current = null
      }
    }
  }, [isEditMode])

  // Handle right-click for creating new geofence
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    if (onRightClickRef.current && !isEditMode) {
      // Add right-click handler (contextmenu event)
      mapRightClickHandlerRef.current = (e) => {
        e.originalEvent.preventDefault() // Prevent default context menu
        onRightClickRef.current(e.latlng.lat, e.latlng.lng)
      }
      map.on('contextmenu', mapRightClickHandlerRef.current)
    } else {
      // Remove right-click handler
      if (mapRightClickHandlerRef.current) {
        map.off('contextmenu', mapRightClickHandlerRef.current)
        mapRightClickHandlerRef.current = null
      }
    }

    return () => {
      // Cleanup right-click handler
      if (map && mapRightClickHandlerRef.current) {
        map.off('contextmenu', mapRightClickHandlerRef.current)
        mapRightClickHandlerRef.current = null
      }
    }
  }, [isEditMode])

  // Handle polygon drawing/editing mode
  useEffect(() => {
    if (!mapInstanceRef.current) return
    
    const map = mapInstanceRef.current
    
    // Check if we should enable polygon drawing (for both add and edit modes)
    const shouldDrawPolygon = editFormData && editFormData.type === 'polygon' && isEditMode
    
    if (shouldDrawPolygon) {
      // Function to update polygon shape from markers
      const updatePolygonShape = () => {
        const coords = polygonMarkersRef.current.map(m => m.getLatLng())
        
        if (polygonShapeRef.current) {
          polygonShapeRef.current.remove()
        }
        
        if (coords.length >= 3) {
          polygonShapeRef.current = L.polygon(coords, {
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            weight: 2,
          }).addTo(map)
        }
        
        // Update coordinates in form/store
        const updatedCoords = coords.map(latlng => ({ lat: latlng.lat, lng: latlng.lng }))
        
        if (selectedGeofence && onGeofenceUpdateRef.current) {
          // Editing existing geofence
          onGeofenceUpdateRef.current(selectedGeofence.id, {
            coordinates: updatedCoords
          })
        } else if (onFormDataUpdateRef.current) {
          // Adding new geofence - update form data
          onFormDataUpdateRef.current({ coordinates: updatedCoords })
        }
      }
      
      // Load existing coordinates if editing and not already loaded
      const existingCoords = selectedGeofence?.coordinates || editFormData?.coordinates || []
      if (existingCoords.length > 0) {
        // Create markers
        existingCoords.forEach(coord => {
          const marker = L.marker([coord.lat, coord.lng], {
            icon: L.divIcon({
              className: 'polygon-point',
              html: '<div style="width: 10px; height: 10px; background: blue; border: 2px solid white; border-radius: 50%; cursor: move;"></div>',
              iconSize: [10, 10],
            }),
            draggable: true,
          }).addTo(map)
          
          // Handle marker drag
          marker.on('dragend', () => {
            updatePolygonShape()
          })
          
          polygonMarkersRef.current.push(marker)
        })
        
        // Draw polygon if we have enough points
        if (existingCoords.length >= 3) {
          updatePolygonShape()
        }
      }
      
      // Add click handler for polygon points
      const polygonClickHandler = (e) => {
        // Add a new point
        const marker = L.marker(e.latlng, {
          icon: L.divIcon({
            className: 'polygon-point',
            html: '<div style="width: 10px; height: 10px; background: blue; border: 2px solid white; border-radius: 50%; cursor: move;"></div>',
            iconSize: [10, 10],
          }),
          draggable: true,
        }).addTo(map)
        
        // Handle marker drag
        marker.on('dragend', () => {
          updatePolygonShape()
        })
        
        polygonMarkersRef.current.push(marker)
        // Don't update polygon shape on click, only on marker drag
      }
      
      map.on('click', polygonClickHandler)
      
      return () => {
        map.off('click', polygonClickHandler)
      }
    } else {
      // Clean up polygon drawing
      polygonMarkersRef.current.forEach(m => m.remove())
      polygonMarkersRef.current = []
      
      if (polygonShapeRef.current) {
        polygonShapeRef.current.remove()
        polygonShapeRef.current = null
      }
    }
  }, [editFormData, isEditMode, selectedGeofence])

  // Handle circle editing markers for form-based editing
  useEffect(() => {
    if (!mapInstanceRef.current) return
    
    const map = mapInstanceRef.current
    
    // Show form edit marker for circles when in edit mode with valid coordinates
    const shouldShowFormMarker = editFormData && 
                                 editFormData.type === 'circle' && 
                                 isEditMode &&
                                 editFormData.latitude && 
                                 editFormData.longitude &&
                                 !selectedGeofence // Only for new geofences being created
    
    // Clean up existing markers and circle
    if (formEditMarkerRef.current) {
      formEditMarkerRef.current.remove()
      formEditMarkerRef.current = null
    }
    if (formRadiusHandleRef.current) {
      formRadiusHandleRef.current.remove()
      formRadiusHandleRef.current = null
    }
    if (formCircleRef.current) {
      formCircleRef.current.remove()
      formCircleRef.current = null
    }
    
    if (shouldShowFormMarker) {
      const lat = parseFloat(editFormData.latitude)
      const lng = parseFloat(editFormData.longitude)
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const radius = parseFloat(editFormData.radius) || 0
        
        // Create draggable marker for center
        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: L.divIcon({
            className: 'form-edit-marker',
            html: '<div style="width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; cursor: move; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
          })
        }).addTo(map)
        
        // Handle drag to update form coordinates
        marker.on('dragend', (e) => {
          const newPos = e.target.getLatLng()
          if (onFormDataUpdateRef.current) {
            onFormDataUpdateRef.current({
              latitude: newPos.lat.toString(),
              longitude: newPos.lng.toString()
            })
          }
        })
        
        formEditMarkerRef.current = marker
        
        // Draw circle if radius is provided
        if (radius > 0) {
          const circle = L.circle([lat, lng], {
            radius: radius,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            weight: 2,
          }).addTo(map)
          formCircleRef.current = circle
          
          // Add radius handle
          const radiusHandleLat = lat + (radius / 111320)
          const radiusHandleLng = lng
          
          const radiusHandle = L.marker([radiusHandleLat, radiusHandleLng], {
            draggable: true,
            icon: L.divIcon({
              className: 'form-radius-handle',
              html: '<div style="width: 12px; height: 12px; background: red; border: 2px solid white; border-radius: 50%; cursor: n-resize;"></div>',
              iconSize: [12, 12],
            })
          }).addTo(map)
          
          radiusHandle.on('dragend', (e) => {
            const handlePos = e.target.getLatLng()
            const centerPos = marker.getLatLng()
            
            // Calculate distance using Leaflet's distance method
            const newRadius = map.distance(centerPos, handlePos)
            
            if (onFormDataUpdateRef.current) {
              onFormDataUpdateRef.current({
                radius: newRadius.toString()
              })
            }
          })
          
          formRadiusHandleRef.current = radiusHandle
        }
      }
    }
    
    return () => {
      if (formEditMarkerRef.current) {
        formEditMarkerRef.current.remove()
        formEditMarkerRef.current = null
      }
      if (formRadiusHandleRef.current) {
        formRadiusHandleRef.current.remove()
        formRadiusHandleRef.current = null
      }
      if (formCircleRef.current) {
        formCircleRef.current.remove()
        formCircleRef.current = null
      }
    }
  }, [editFormData, isEditMode, selectedGeofence])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up markers
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []
      }
      // Clean up geofence layers
      if (geofenceLayersRef.current) {
        geofenceLayersRef.current.forEach(layer => layer.remove())
        geofenceLayersRef.current = []
      }
      // Clean up polygon markers
      if (polygonMarkersRef.current) {
        polygonMarkersRef.current.forEach(marker => marker.remove())
        polygonMarkersRef.current = []
      }
      // Clean up form markers
      if (formEditMarkerRef.current) {
        formEditMarkerRef.current.remove()
        formEditMarkerRef.current = null
      }
      if (formRadiusHandleRef.current) {
        formRadiusHandleRef.current.remove()
        formRadiusHandleRef.current = null
      }
      if (formCircleRef.current) {
        formCircleRef.current.remove()
        formCircleRef.current = null
      }
      if (polygonShapeRef.current) {
        polygonShapeRef.current.remove()
        polygonShapeRef.current = null
      }
      // Clean up map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (tileLayerRef.current) {
        tileLayerRef.current.remove()
        tileLayerRef.current = null
      }
    }
  }, [])

  return (
    <div ref={mapRef} className="w-full h-full rounded-2xl" style={{ minHeight: '320px' }} />
  )
}
