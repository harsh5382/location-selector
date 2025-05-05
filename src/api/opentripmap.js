import { API_CONFIG } from "../config";

const cityCache = new Map();

async function fetchWithBackoff(
  url,
  retries = API_CONFIG.BACKOFF_RETRIES,
  delay = API_CONFIG.BACKOFF_INITIAL_DELAY
) {
  for (let i = 0; i < retries; i++) {
    const resp = await fetch(url);
    if (resp.status === 429) {
      console.log(`OpenTripMap rate limit hit, retrying after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
      continue;
    }
    return resp;
  }
  throw new Error("Max retries reached due to OpenTripMap rate limits");
}

export async function fetchNearbyCities(
  lat,
  lon,
  radius = 500,
  limit = API_CONFIG.OPEN_TRIPMAP_LIMIT
) {
  const cacheKey = `${lat},${lon},${radius},${limit}`;
  const cached = cityCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < API_CONFIG.CITY_CACHE_DURATION) {
    console.log(`Using cached cities for ${cacheKey}`);
    return cached.data;
  }

  const apiKey = import.meta.env.VITE_OPENTRIPMAP_API_KEY;
  const endpoint = `/opentripmap/0.1/en/places/radius`;
  const url = `${endpoint}?radius=${
    radius * 1000
  }&lon=${lon}&lat=${lat}&limit=${limit}&apikey=${apiKey}&kinds=settlements`;
  try {
    console.log("Fetching nearby cities:", url);
    const resp = await fetchWithBackoff(url);
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(
        `OpenTripMap API error: ${resp.status} ${resp.statusText} - ${errorText}`
      );
    }
    const data = await resp.json();
    console.log("Raw API response:", JSON.stringify(data, null, 2));
    let cities = data.features
      ? data.features
          .filter((f) => f.properties.name)
          .map((f) => ({
            name: f.properties.name,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            ...f.properties,
          }))
      : [];

    if (cities.length === 0) {
      console.log("No cities found, using fallback city list");
      cities = getFallbackCities(lat, lon, radius);
    }

    cityCache.set(cacheKey, { data: cities, timestamp: now });
    console.log("Filtered cities:", cities);
    return cities;
  } catch (error) {
    console.error("fetchNearbyCities error:", error);
    console.log("API failed, using fallback city list");
    const fallbackCities = getFallbackCities(lat, lon, radius);
    cityCache.set(cacheKey, { data: fallbackCities, timestamp: now });
    return fallbackCities;
  }
}

function getFallbackCities(lat, lon, radius) {
  const fallbackCities = [
    { name: "Ahmedabad", lat: 23.03, lon: 72.58 },
    { name: "Surat", lat: 21.17, lon: 72.83 },
    { name: "Vadodara", lat: 22.31, lon: 73.18 },
    { name: "Rajkot", lat: 22.3, lon: 70.78 },
    { name: "Mumbai", lat: 19.07, lon: 72.88 },
    { name: "Gandhinagar", lat: 23.22, lon: 72.68 },
    { name: "Bhavnagar", lat: 21.76, lon: 72.15 },
    { name: "Jamnagar", lat: 22.47, lon: 70.06 },
  ];
  return fallbackCities.filter((city) => {
    const distanceKm =
      Math.sqrt(Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2)) *
      111; // Approximate distance in km
    return distanceKm <= radius;
  });
}

export async function fetchCityCoordinates(cityName) {
  const apiKey = import.meta.env.VITE_OPENTRIPMAP_API_KEY;
  const url = `/opentripmap/0.1/en/places/geoname?name=${encodeURIComponent(
    cityName
  )}&apikey=${apiKey}`;
  try {
    console.log("Fetching city coordinates:", url);
    const resp = await fetchWithBackoff(url);
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(
        `fetchCityCoordinates error: ${resp.status} ${resp.statusText} - ${errorText}`
      );
    }
    const data = await resp.json();
    console.log("City coordinates response:", data);
    return {
      lat: data.lat,
      lon: data.lon,
      name: data.name,
      country: data.country,
    };
  } catch (error) {
    console.error("fetchCityCoordinates error:", error);
    return null;
  }
}
