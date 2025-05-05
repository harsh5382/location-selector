import { MapPin, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import LocationSelector from "./components/LocationSelector";
import DistanceSelector from "./components/DistanceSelector";
import TemperatureRangeSelector from "./components/TemperatureRangeSelector";
import ResultsList from "./components/ResultsList";
import {
  fetchNearbyCities,
  fetchWeather,
  fetchCityCoordinates,
} from "./utils/api";
import { haversineDistance } from "./utils/distance";
import { API_CONFIG } from "./config";

import "./index.css";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [selectedCity, setSelectedCity] = useState({
    name: "Ahmedabad",
    lat: 23.03,
    lon: 72.58,
  });
  const [distance, setDistance] = useState(500);
  const [minTemp, setMinTemp] = useState(15);
  const [maxTemp, setMaxTemp] = useState(35);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([
    { name: "Ahmedabad", lat: 23.03, lon: 72.58 },
    { name: "Mumbai", lat: 19.07, lon: 72.88 },
    { name: "Delhi", lat: 28.61, lon: 77.21 },
    { name: "Jaipur", lat: 26.91, lon: 75.79 },
    { name: "Surat", lat: 21.17, lon: 72.83 },
  ]);
  const [page, setPage] = useState(1);

  // Toggle dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleSearch = useCallback(
    async (append = false) => {
      setLoading(true);
      try {
        console.log(
          "Searching with city:",
          JSON.stringify(selectedCity, null, 2)
        );
        const nearbyCities = await fetchNearbyCities(
          selectedCity.lat,
          selectedCity.lon,
          distance,
          API_CONFIG.CITIES_PER_PAGE
        );

        console.log("Nearby cities fetched:", nearbyCities);
        if (nearbyCities.length === 0) {
          setResults(append ? results : []);
          toast.error(
            "No nearby cities found within the specified distance. Try increasing the distance (e.g., 1000 km), selecting a different city (e.g., Mumbai), or widening the temperature range.",
            { position: "top-right", autoClose: 5000 }
          );
          return;
        }

        const filteredCities = await Promise.all(
          nearbyCities.map(async (city) => {
            const weather = await fetchWeather(city.lat, city.lon);
            if (!weather) {
              console.log(`No weather data for ${city.name}`);
              return null;
            }

            const distanceKm = haversineDistance(
              selectedCity.lat,
              selectedCity.lon,
              city.lat,
              city.lon
            );

            if (distanceKm > distance) {
              console.log(`City ${city.name} too far: ${distanceKm} km`);
              return null;
            }

            const result = {
              name: city.name,
              temperature: weather.temperature,
              icon: weather.icon,
              description: weather.description,
              distance: distanceKm,
              lat: city.lat,
              lon: city.lon,
            };
            console.log(`City result:`, JSON.stringify(result, null, 2));
            return result;
          })
        ).then((cities) =>
          cities
            .filter((city) => {
              if (!city) return false;
              const inTempRange =
                city.temperature >= minTemp && city.temperature <= maxTemp;
              if (!inTempRange) {
                console.log(
                  `City ${city.name} filtered out: temperature ${city.temperature}°C not in range ${minTemp}-${maxTemp}°C`
                );
              }
              return inTempRange;
            })
            .filter((city) => city.name !== "")
        );

        console.log("Filtered results:", filteredCities);
        setResults((prev) =>
          append ? [...prev, ...filteredCities] : filteredCities
        );

        if (filteredCities.length === 0) {
          toast.warn(
            `No cities found with temperatures between ${minTemp}°C and ${maxTemp}°C within ${distance} km. Try widening the temperature range (e.g., 10-40°C) or increasing the distance.`,
            { position: "top-right", autoClose: 5000 }
          );
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults(append ? results : []);
        toast.error(`Error: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedCity, distance, minTemp, maxTemp, results]
  );

  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
      handleSearch(false);
    }, API_CONFIG.DEBOUNCE_DELAY),
    [handleSearch]
  );

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    handleSearch(true);
  };

  const handleDetectLocation = async () => {
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const cityData = await fetchCityCoordinates("Ahmedabad"); // Fallback to Ahmedabad
          const city = cityData || {
            name: "Current Location",
            lat: latitude,
            lon: longitude,
          };
          console.log("Detected location:", city);
          setSelectedCity(city);
          setLocations((prev) => [
            city,
            ...prev.filter((loc) => loc.name !== city.name),
          ]);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(
            "Unable to detect location. Using Ahmedabad as default.",
            {
              position: "top-right",
              autoClose: 5000,
            }
          );
          const city = {
            name: "Ahmedabad",
            lat: 23.03,
            lon: 72.58,
          };
          setSelectedCity(city);
          setLocations((prev) => [
            city,
            ...prev.filter((loc) => loc.name !== city.name),
          ]);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Geolocation error:", error);
      toast.error("Unable to detect location. Please select a city manually.", {
        position: "top-right",
        autoClose: 5000,
      });
      setLoading(false);
    }
  };

  const handleTempChange = (type, value) => {
    if (type === "min") setMinTemp(value);
    if (type === "max") setMaxTemp(value);
  };

  return (
    <div
      className={`min-h-screen ${isDark ? "dark bg-gray-900" : "bg-gray-100"}`}
    >
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <MapPin className="mr-2 text-blue-500" size={20} />
              Climate-Based Location Finder
            </h1>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>

          <div className="space-y-6">
            <LocationSelector
              locations={locations}
              onSelect={async (name) => {
                const city = locations.find((loc) => loc.name === name);
                if (city) {
                  setSelectedCity(city);
                } else {
                  const cityData = await fetchCityCoordinates(name);
                  if (cityData) {
                    setSelectedCity(cityData);
                    setLocations((prev) => [
                      cityData,
                      ...prev.filter((loc) => loc.name !== name),
                    ]);
                  } else {
                    toast.error(`City "${name}" not found. Try another city.`, {
                      position: "top-right",
                      autoClose: 5000,
                    });
                  }
                }
              }}
              onDetectLocation={handleDetectLocation}
            />

            <DistanceSelector
              distances={[50, 100, 250, 500, 1000]}
              value={distance}
              onSelect={setDistance}
            />

            <TemperatureRangeSelector
              min={minTemp}
              max={maxTemp}
              onChange={handleTempChange}
              minLimit={0}
              maxLimit={50}
            />

            <button
              onClick={debouncedSearch}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2" /> Find Locations
                </>
              )}
            </button>
          </div>

          <ResultsList results={results} loading={loading} />

          {results.length > 0 &&
            results.length >= page * API_CONFIG.CITIES_PER_PAGE && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
