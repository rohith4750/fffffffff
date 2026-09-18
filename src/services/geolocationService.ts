export interface GeoCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

// Preset collection zones for realistic field simulations
export const FIELD_ZONES = [
  { name: 'Kukatpally Main Market', lat: 17.4947, lng: 78.3996, address: 'Road No. 1, KPHB Colony, Hyderabad' },
  { name: 'Ameerpet Commercial Hub', lat: 17.4375, lng: 78.4482, address: 'Near Metro Station, Ameerpet, Hyderabad' },
  { name: 'Secunderabad Station Road', lat: 17.4399, lng: 78.4983, address: 'MG Road, Secunderabad' },
  { name: 'Madhapur Craft Market', lat: 17.4483, lng: 78.3915, address: 'Hitech City Road, Madhapur, Hyderabad' },
  { name: 'Dilsukhnagar Bus Depot Area', lat: 17.3688, lng: 78.5247, address: 'National Highway 65, Dilsukhnagar, Hyderabad' },
  { name: 'Charminar Bazzar', lat: 17.3616, lng: 78.4747, address: 'Lad Bazaar, Charminar, Hyderabad' },
];

/**
 * Get current browser GPS location or fallback to realistic coordinate
 */
export async function getCurrentGpsLocation(): Promise<GeoCoords> {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy || 12),
            address: `GPS Verified (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
          });
        },
        (error) => {
          console.warn('Geolocation permission error or unavailable:', error.message);
          // Pick a random field zone for realistic simulation
          const zone = FIELD_ZONES[Math.floor(Math.random() * FIELD_ZONES.length)];
          const jitterLat = (Math.random() - 0.5) * 0.005;
          const jitterLng = (Math.random() - 0.5) * 0.005;
          resolve({
            latitude: Number((zone.lat + jitterLat).toFixed(6)),
            longitude: Number((zone.lng + jitterLng).toFixed(6)),
            accuracy: 8,
            address: zone.address,
          });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      const zone = FIELD_ZONES[0];
      resolve({
        latitude: zone.lat,
        longitude: zone.lng,
        accuracy: 15,
        address: zone.address,
      });
    }
  });
}
