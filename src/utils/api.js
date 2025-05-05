import { fetchWeather } from "../api/openweathermap";
export { fetchNearbyCities, fetchCityCoordinates } from "../api/opentripmap";
export { fetchWeather } from "../api/openweathermap";

export async function fetchCurrentTemperature(lat, lon) {
  const weather = await fetchWeather(lat, lon);
  return weather ? weather.temperature : null;
}
