import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { motion } from 'framer-motion'
import { MapPin, RotateCcw, Trash2, Plus } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to handle map click events
const MapClickHandler = ({ onMapClick, isDrawing }) => {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

export const GeofenceMap = ({ 
  center = [37.7749, -122.4194], 
  zoom = 13, 
  polygon = [], 
  onPolygonChange,
  onCenterChange,
  isDrawing = false,
  onToggleDrawing
}) => {
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)
  const [currentPolygon, setCurrentPolygon] = useState(polygon)
  const [isMapDrawing, setIsMapDrawing] = useState(isDrawing)
  const mapRef = useRef()

  useEffect(() => {
    setCurrentPolygon(polygon)
  }, [polygon])

  useEffect(() => {
    setMapCenter(center)
  }, [center])

  const handleMapClick = (latlng) => {
    if (!isMapDrawing) return
    
    const newPoint = [latlng.lat, latlng.lng]
    const updatedPolygon = [...currentPolygon, newPoint]
    setCurrentPolygon(updatedPolygon)
    onPolygonChange(updatedPolygon)
  }

  const handleToggleDrawing = () => {
    const newDrawingState = !isMapDrawing
    setIsMapDrawing(newDrawingState)
    onToggleDrawing(newDrawingState)
  }

  const clearPolygon = () => {
    setCurrentPolygon([])
    onPolygonChange([])
  }

  const removeLastPoint = () => {
    if (currentPolygon.length > 0) {
      const updatedPolygon = currentPolygon.slice(0, -1)
      setCurrentPolygon(updatedPolygon)
      onPolygonChange(updatedPolygon)
    }
  }

  const addPointAtCenter = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter()
      const newPoint = [center.lat, center.lng]
      const updatedPolygon = [...currentPolygon, newPoint]
      setCurrentPolygon(updatedPolygon)
      onPolygonChange(updatedPolygon)
    }
  }

  const polygonPositions = currentPolygon.map(point => [point[0], point[1]])

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Interactive Map
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {currentPolygon.length} points
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleToggleDrawing}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isMapDrawing
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMapDrawing ? 'Stop Drawing' : 'Start Drawing'}
          </motion.button>
          
          <motion.button
            onClick={addPointAtCenter}
            className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Add point at map center"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={removeLastPoint}
            disabled={currentPolygon.length === 0}
            className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Remove last point"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={clearPolygon}
            disabled={currentPolygon.length === 0}
            className="p-1.5 bg-danger-100 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 rounded-lg hover:bg-danger-200 dark:hover:bg-danger-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Clear all points"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Drawing Instructions */}
      {isMapDrawing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3"
        >
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Click on the map to add polygon points. Click "Stop Drawing" when finished.
            </p>
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div className="relative">
        <div className="h-96 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            whenReady={() => {
              if (mapRef.current) {
                mapRef.current.on('moveend', () => {
                  const center = mapRef.current.getCenter()
                  onCenterChange([center.lat, center.lng])
                })
              }
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickHandler onMapClick={handleMapClick} isDrawing={isMapDrawing} />
            
            {/* Center Marker */}
            <Marker position={mapCenter}>
              <L.Popup>
                <div className="text-center">
                  <p className="font-medium">Map Center</p>
                  <p className="text-xs text-slate-500">
                    {mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}
                  </p>
                </div>
              </L.Popup>
            </Marker>
            
            {/* Polygon Points */}
            {currentPolygon.map((point, index) => (
              <Marker key={index} position={[point[0], point[1]]}>
                <L.Popup>
                  <div className="text-center">
                    <p className="font-medium">Point {index + 1}</p>
                    <p className="text-xs text-slate-500">
                      {point[0].toFixed(6)}, {point[1].toFixed(6)}
                    </p>
                  </div>
                </L.Popup>
              </Marker>
            ))}
            
            {/* Polygon */}
            {currentPolygon.length >= 3 && (
              <Polygon
                positions={polygonPositions}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              />
            )}
          </MapContainer>
        </div>
        
        {/* Map Overlay Info */}
        <div className="absolute top-2 right-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 text-xs">
          <div className="space-y-1">
            <div className="font-medium text-slate-700 dark:text-slate-300">Center</div>
            <div className="text-slate-500 dark:text-slate-400">
              {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Polygon Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            currentPolygon.length >= 3 ? 'bg-success-500' : 'bg-warning-500'
          }`}></div>
          <span className="text-slate-600 dark:text-slate-400">
            {currentPolygon.length >= 3 
              ? 'Valid polygon' 
              : `Need ${3 - currentPolygon.length} more points`
            }
          </span>
        </div>
        
        {currentPolygon.length > 0 && (
          <button
            onClick={() => {
              if (mapRef.current) {
                const bounds = L.polygon(polygonPositions).getBounds()
                mapRef.current.fitBounds(bounds, { padding: [20, 20] })
              }
            }}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs font-medium"
          >
            Fit to polygon
          </button>
        )}
      </div>
    </div>
  )
}
