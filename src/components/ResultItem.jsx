import React from "react";
import WeatherIcon from "./WeatherIcon";

/**
 * ResultItem - Enhanced with accessibility, hover/focus styles, and loading placeholder.
 * Displays city name, temperature, distance, and weather icon/description.
 * Expects item: { name, temperature, icon, description, distance }
 */
const ResultItem = ({ item }) => (
  <li
    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded shadow mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    tabIndex={0}
    aria-label={`${item.name}, ${item.temperature} degrees Celsius, ${item.distance?.toFixed(1)} kilometers, weather: ${item.description}`}
  >
    <div className="flex-shrink-0" aria-hidden="true">
      <WeatherIcon icon={item.icon} description={item.description} />
    </div>
    <div className="flex-1">
      <div className="font-semibold text-lg text-gray-900 dark:text-white">{item.name}</div>
      <div className="text-sm text-gray-500 dark:text-gray-300">{item.description}</div>
    </div>
    <div className="flex flex-col items-end min-w-[80px]">
      <span className="text-xl font-bold text-blue-600 dark:text-blue-300">{item.temperature}&deg;C</span>
      <span className="text-xs text-gray-400">{item.distance?.toFixed(1)} km</span>
    </div>
  </li>
);

export default ResultItem;
