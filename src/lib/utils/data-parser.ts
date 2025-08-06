import Papa from 'papaparse';

export interface Aircraft {
  manufacturer: string;
  icao_code: string;
  model: string;
  physical_class: string;
  number_of_engines: number;
  weight: number;
}

export interface Waypoint {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Parse CSV data for aircraft
 */
export const parseAircraftData = async (): Promise<Aircraft[]> => {
  try {
    const response = await fetch('/data/aircraft-data.csv');
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        if (field === 'weight' || field === 'number_of_engines') {
          const num = parseFloat(value);
          return isNaN(num) ? null : num;
        }
        return value;
      }
    });
    
    return result.data as Aircraft[];
  } catch (error) {
    console.error('Error parsing aircraft data:', error);
    return [];
  }
};

/**
 * Parse CSV data for waypoints
 */
export const parseWaypointsData = async (): Promise<Waypoint[]> => {
  try {
    const response = await fetch('/data/waypoints.csv');
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        if (field === 'latitude' || field === 'longitude') {
          const num = parseFloat(value);
          return isNaN(num) ? 0 : num;
        }
        return value;
      }
    });
    
    return result.data as Waypoint[];
  } catch (error) {
    console.error('Error parsing waypoints data:', error);
    return [];
  }
};

/**
 * Calculate distance between two waypoints using the Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance;
};

/**
 * Helper function to convert degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};