'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Extend Window interface to include google
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

interface MapComponentProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onMapReady?: (map: any) => void;
}

function MapComponent({ initialLat, initialLng, onLocationSelect, onMapReady }: MapComponentProps) {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Function to get user's current location
  const getUserCurrentLocation = (mapInstance: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          
          console.log('User location found:', userLat, userLng, 'Accuracy:', accuracy, 'meters');
          
          setUserLocation({ lat: userLat, lng: userLng });
          
          // Create a custom marker for user location (blue dot with accuracy circle)
          const userMarker = new window.google.maps.Marker({
            position: { lat: userLat, lng: userLng },
            map: mapInstance,
            title: `Your Location (Accuracy: ${Math.round(accuracy)}m)`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
            },
            zIndex: 1000, // Ensure it's on top
          });
          
          // Add accuracy circle
          const accuracyCircle = new window.google.maps.Circle({
            center: { lat: userLat, lng: userLng },
            radius: accuracy,
            map: mapInstance,
            fillColor: '#4285F4',
            fillOpacity: 0.1,
            strokeColor: '#4285F4',
            strokeOpacity: 0.3,
            strokeWeight: 1,
            zIndex: 999,
          });
          
          setUserLocationMarker(userMarker);
          
          // Store the circle reference for cleanup
          (userMarker as any).accuracyCircle = accuracyCircle;
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Don't show error to user, just silently fail
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser');
    }
  };

  const mapRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && initialLat !== 0 && initialLng !== 0) {
      // Wait for Google Maps to be available
      const initMap = () => {
        if (window.google?.maps) {
          try {
            console.log('Initializing Google Map with coordinates:', initialLat, initialLng);
            const mapInstance = new window.google.maps.Map(node, {
              center: { lat: initialLat, lng: initialLng },
              zoom: 20,
              mapTypeId: window.google.maps.MapTypeId.SATELLITE,
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
              clickableIcons: false,
            });

            const markerInstance = new window.google.maps.Marker({
              position: { lat: initialLat, lng: initialLng },
              map: mapInstance,
              draggable: true,
              title: 'Classroom Location',
            });

            // Handle map clicks
            mapInstance.addListener('click', (event: any) => {
              if (event.latLng) {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                markerInstance.setPosition({ lat, lng });
                onLocationSelect(lat, lng);
              }
            });

            // Handle marker drag
            markerInstance.addListener('dragend', () => {
              const position = markerInstance.getPosition();
              if (position) {
                const lat = position.lat();
                const lng = position.lng();
                onLocationSelect(lat, lng);
              }
            });

            setMap(mapInstance);
            setMarker(markerInstance);
            console.log('Google Map initialized successfully');
            
            // Notify parent component that map is ready
            if (onMapReady) {
              onMapReady(mapInstance);
            }
            
            // Get user's current location
            getUserCurrentLocation(mapInstance);
          } catch (error) {
            console.error('Error creating map:', error);
          }
        } else {
          // Retry after a short delay
          setTimeout(initMap, 100);
        }
      };
      
      initMap();
    }
  }, [initialLat, initialLng, onLocationSelect]);

  // Update map center when coordinates change
  useEffect(() => {
    if (map && marker && initialLat !== 0 && initialLng !== 0) {
      const newPosition = { lat: initialLat, lng: initialLng };
      map.setCenter(newPosition);
      marker.setPosition(newPosition);
    }
  }, [map, marker, initialLat, initialLng]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}

function LoadingComponent() {
  return (
    <div className="flex items-center justify-center h-96 bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading Google Maps...</p>
      </div>
    </div>
  );
}

function ErrorComponent({ onRetry, onUseFallback }: { onRetry?: () => void; onUseFallback?: () => void }) {
  return (
    <div className="flex items-center justify-center h-96 bg-red-50">
      <div className="text-center max-w-md">
        <p className="text-sm text-red-600 mb-2">Failed to load Google Maps</p>
        <p className="text-xs text-red-500 mb-4">
          This could be due to:
          <br />• API key not configured
          <br />• Maps JavaScript API not enabled
          <br />• Billing not set up
          <br />• API key restrictions
        </p>
        <div className="space-y-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          )}
          {onUseFallback && (
            <button
              onClick={onUseFallback}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 ml-2"
            >
              Use Manual Entry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GoogleMapLocationPicker({ 
  initialLat, 
  initialLng, 
  onLocationSelect, 
  onClose 
}: GoogleMapLocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const hasAutoLocated = useRef(false);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    onLocationSelect(lat, lng);
  }, [onLocationSelect]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    console.log('Google Maps API Key loaded:', key ? 'Yes' : 'No');
    setApiKey(key);
  }, []);

  useEffect(() => {
    // Only auto-locate once when modal opens (for new classes)
    if (hasAutoLocated.current) return;
    
    const initializeLocation = async () => {
      if (!apiKey) {
        setIsLoading(false);
        hasAutoLocated.current = true;
        return;
      }

      try {
        let lat = initialLat;
        let lng = initialLng;

        // If no initial coordinates provided, try to get user's current location first
        if (!lat || !lng) {
          // Try to get user's precise location automatically
          if (navigator.geolocation) {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0, // Always get fresh location
                  }
                );
              });

              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              const accuracy = position.coords.accuracy;

              console.log('Auto-fetched user location:', userLat, userLng, 'Accuracy:', accuracy, 'meters');
              
              lat = userLat;
              lng = userLng;
              setUserLocation({ lat: userLat, lng: userLng });
              
              // Update selected position immediately
              setSelectedPosition([userLat, userLng]);
              handleLocationSelect(userLat, userLng);
              hasAutoLocated.current = true;
              setIsLoading(false);
              return; // Exit early since we got the location
            } catch (geolocationError: any) {
              console.warn('Auto geolocation failed, falling back to CMU campus:', geolocationError.message);
              // Fall through to CMU campus geocoding
            }
          }

          // If geolocation failed or not available, geocode CMU campus
          if (!lat || !lng) {
            // Check if Google Maps API is fully loaded
            if (window.google?.maps?.Geocoder) {
              try {
                const geocoder = new window.google.maps.Geocoder();
                const result = await new Promise<any[]>((resolve, reject) => {
                  geocoder.geocode(
                    { address: 'Central Michigan University, Mount Pleasant, MI' },
                    (results: any, status: any) => {
                      if (status === 'OK' && results) {
                        resolve(results);
                      } else {
                        reject(new Error(`Geocoding failed: ${status}`));
                      }
                    }
                  );
                });

                if (result.length > 0) {
                  const location = result[0].geometry.location;
                  lat = location.lat();
                  lng = location.lng();
                } else {
                  // Fallback to approximate CMU coordinates
                  lat = 43.5842;
                  lng = -84.7674;
                }
              } catch (geocodingError) {
                console.warn('Geocoding failed, using fallback coordinates:', geocodingError);
                // Fallback to approximate CMU coordinates
                lat = 43.5842;
                lng = -84.7674;
              }
            } else {
              // Google Maps API not ready, use fallback coordinates
              lat = 43.5842;
              lng = -84.7674;
            }
          }
        }

        // Only update if we haven't already set from geolocation
        if (selectedPosition[0] === 0 && selectedPosition[1] === 0) {
          setSelectedPosition([lat || 43.5842, lng || -84.7674]);
        }
        setIsLoading(false);
        hasAutoLocated.current = true;
      } catch (err) {
        console.error('Error initializing location:', err);
        setError('Failed to load location');
        // Fallback coordinates
        if (selectedPosition[0] === 0 && selectedPosition[1] === 0) {
          setSelectedPosition([43.5842, -84.7674]);
        }
        setIsLoading(false);
        hasAutoLocated.current = true;
      }
    };

    if (apiKey && window.google?.maps?.Geocoder) {
      initializeLocation();
    } else if (apiKey) {
      // Wait for Google Maps to load completely
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.Geocoder) {
          clearInterval(checkGoogle);
          initializeLocation();
        }
      }, 100);

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkGoogle);
        setError('Google Maps API failed to load');
        setIsLoading(false);
        hasAutoLocated.current = true;
      }, 10000);

      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
      };
    } else {
      setIsLoading(false);
      hasAutoLocated.current = true;
    }
  }, [apiKey, initialLat, initialLng, handleLocationSelect]);


  const handleConfirm = () => {
    onLocationSelect(selectedPosition[0], selectedPosition[1]);
    onClose();
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError('');
    // Force re-initialization
    window.location.reload();
  };

  const handleUseFallback = () => {
    // Use the current coordinates and close the modal
    handleConfirm();
  };

  // Function to get user's current location
  const getUserCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          
          console.log('User location found:', userLat, userLng, 'Accuracy:', accuracy, 'meters');
          
          setUserLocation({ lat: userLat, lng: userLng });
          
          // Update selected position to user location
          setSelectedPosition([userLat, userLng]);
          handleLocationSelect(userLat, userLng);
          
          // Center map on user location
          if (mapInstance) {
            mapInstance.setCenter({ lat: userLat, lng: userLng });
            mapInstance.setZoom(20);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          alert('Unable to get your location. Please allow location access or select manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  };

  const render = (status: Status) => {
    console.log('Google Maps Wrapper Status:', status);
    
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    if (error) {
      return <ErrorComponent onRetry={handleRetry} onUseFallback={handleUseFallback} />;
    }

    switch (status) {
      case Status.LOADING:
        return <LoadingComponent />;
      case Status.FAILURE:
        console.error('Google Maps Wrapper failed to load');
        return <ErrorComponent onRetry={handleRetry} onUseFallback={handleUseFallback} />;
      case Status.SUCCESS:
        return (
          <MapComponent
            initialLat={selectedPosition[0]}
            initialLng={selectedPosition[1]}
            onLocationSelect={handleLocationSelect}
            onMapReady={(map) => {
              setMapInstance(map);
              // Auto-center map on user location if available and no initial coordinates
              if (userLocation && (!initialLat || !initialLng)) {
                map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
                map.setZoom(20);
              }
            }}
          />
        );
      default:
        return <LoadingComponent />;
    }
  };

  if (!apiKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg max-w-md w-full mx-2 sm:mx-4 p-4 sm:p-6">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Google Maps API Key Required</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              To use Google Maps for precise location selection, you need to configure a Google Maps API key.
            </p>
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Use CMU Building Picker Instead
              </button>
              <p className="text-xs text-gray-500">
                Or configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Select Classroom Location</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Click anywhere on the map or drag the marker to select the precise location of your classroom
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-64 sm:h-80 md:h-96 w-full relative flex-shrink-0">
          <Wrapper apiKey={apiKey} render={render} libraries={["places", "geocoding"]} />
          
          {/* Map Controls */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 space-y-2">
            {/* My Location Button */}
            <button
              onClick={getUserCurrentLocation}
              className="bg-white hover:bg-gray-50 text-gray-700 p-1.5 sm:p-2 rounded-full shadow-lg border border-gray-300 transition-colors"
              title="Get my current location"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* Location Status */}
            {userLocation && (
              <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-lg border border-gray-300 text-xs hidden sm:block">
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Location found</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Coordinates Display */}
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 overflow-y-auto flex-1">
          <div className="space-y-3 sm:space-y-4">
            {/* Coordinate Display */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Selected Coordinates:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={selectedPosition[0].toFixed(6)}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      if (!isNaN(lat)) {
                        setSelectedPosition([lat, selectedPosition[1]]);
                        handleLocationSelect(lat, selectedPosition[1]);
                      }
                    }}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={selectedPosition[1].toFixed(6)}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      if (!isNaN(lng)) {
                        setSelectedPosition([selectedPosition[0], lng]);
                        handleLocationSelect(selectedPosition[0], lng);
                      }
                    }}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  🗺️ Click on the map or drag the marker to select location, or manually enter precise coordinates above
                </p>
                <p className="text-xs text-green-600 font-medium">
                  🎯 Google Maps Precision: ~0.1 meter accuracy with satellite imagery
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                  <button
                    onClick={getUserCurrentLocation}
                    className="flex items-center justify-center space-x-1 px-2 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Use My Location</span>
                  </button>
                  {userLocation && (
                    <span className="text-xs text-green-600 break-all sm:break-normal">
                      ✓ Location found: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
