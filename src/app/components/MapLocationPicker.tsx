'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

function UpdateMarker({ position }: { position: [number, number] }) {
  const map = useMapEvents({});
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  
  return null;
}

export default function MapLocationPicker({ 
  initialLat = 43.5800, 
  initialLng = -84.7780, 
  onLocationSelect, 
  onClose 
}: MapLocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([initialLat, initialLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  const handleConfirm = () => {
    onLocationSelect(selectedPosition[0], selectedPosition[1]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Select Classroom Location</h3>
              <p className="text-sm text-gray-500 mt-1">
                Click anywhere on the map to select the precise location of your classroom
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-96 w-full">
          <MapContainer
            center={[initialLat, initialLng]}
            zoom={20}
            maxZoom={22}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
            <MapClickHandler onLocationSelect={handleMapClick} />
            <UpdateMarker position={selectedPosition} />
          </MapContainer>
        </div>

        {/* Selected Coordinates Display */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-4">
            {/* Coordinate Display */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Coordinates:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={selectedPosition[0].toFixed(6)}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      if (!isNaN(lat)) {
                        setSelectedPosition([lat, selectedPosition[1]]);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={selectedPosition[1].toFixed(6)}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      if (!isNaN(lng)) {
                        setSelectedPosition([selectedPosition[0], lng]);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  💡 Click on the map to select location, or manually enter precise coordinates above
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  🎯 Precision: ~0.1 meter accuracy (6 decimal places)
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
