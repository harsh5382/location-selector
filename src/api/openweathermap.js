import { API_CONFIG } from "../config";

const weatherCache = new Map();

async function fetchWithBackoff(
  url,
  retries = API_CONFIG.BACKOFF_RETRIES,
  delay = API_CONFIG.BACKOFF_INITIAL_DELAY
) {
  for (let i = 0; i < retries; i++) {
    const resp = await fetch(url);
    if (resp.status === 429) {
      console.log(`OpenWeatherMap rate limit hit, retrying after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
      continue;
    }
    return resp;
  }
  throw new Error("Max retries reached due to OpenWeatherMap rate limits");
}

export async function fetchWeather(lat, lon) {
  const cacheKey = `${lat},${lon}`;
  const cached = weatherCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < API_CONFIG.WEATHER_CACHE_DURATION) {
    console.log(`Using cached weather for ${cacheKey}`);
    return cached.data;
  }

  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
  const endpoint = `/openweathermap/data/2.5/weather`;
  const url = `${endpoint}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${API_CONFIG.OPEN_WEATHERMAP_UNITS}`;
  try {
    console.log("Fetching weather:", url);
    const resp = await fetchWithBackoff(url);
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(
        `OpenWeatherMap API error: ${resp.status} ${resp.statusText} - ${errorText}`
      );
    }
    const data = await resp.json();
    const weather = {
      temperature: data.main?.temp,
      icon: data.weather?.[0]?.icon,
      description: data.weather?.[0]?.description,
      name: data.name,
      lat,
      lon,
    };
    console.log("Weather data:", JSON.stringify(weather, null, 2));
    weatherCache.set(cacheKey, { data: weather, timestamp: now });
    return weather;
  } catch (error) {
    console.error("fetchWeather error:", error);
    return null;
  }
}
