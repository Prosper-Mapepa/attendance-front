// Utility functions for Google Maps geocoding

export interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
}

// Extend the Window interface to include Google Maps
declare global {
  interface Window {
    google: any;
  }
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
    throw new Error('Google Maps API not loaded or Geocoder not available');
  }

  const geocoder = new window.google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results && results.length > 0) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

export async function geocodeCMUBuildings(): Promise<Record<string, GeocodingResult>> {
  const buildings = [
    'Engineering Building, Central Michigan University, Mount Pleasant, MI',
    'Business Building, Central Michigan University, Mount Pleasant, MI',
    'Charles V. Park Library, Central Michigan University, Mount Pleasant, MI',
    'Bovee University Center, Central Michigan University, Mount Pleasant, MI',
    'Grawn Hall, Central Michigan University, Mount Pleasant, MI',
    'Sloan Hall, Central Michigan University, Mount Pleasant, MI',
    'Warriner Hall, Central Michigan University, Mount Pleasant, MI',
    'Dow Science Complex, Central Michigan University, Mount Pleasant, MI'
  ];

  const results: Record<string, GeocodingResult> = {};
  
  for (const building of buildings) {
    try {
      const result = await geocodeAddress(building);
      if (result) {
        // Extract building name from the full address
        const buildingName = building.split(',')[0];
        results[buildingName] = result;
      }
    } catch (error) {
      console.warn(`Failed to geocode ${building}:`, error);
    }
  }
  
  return results;
}
