import React from "react";

const WeatherIcon = ({ icon, description }) => {
  if (!icon) {
    return (
      <div
        className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded inline-block align-middle"
        aria-label="No weather icon available"
        title="No weather icon available"
      />
    );
  }
  // OpenWeatherMap icon URL pattern
  const url = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  return (
    <img
      src={url}
      alt={description || "Weather Icon"}
      className="w-8 h-8 inline-block align-middle"
      title={description || "Weather"}
      loading="lazy"
    />
  );
};
export default WeatherIcon;
