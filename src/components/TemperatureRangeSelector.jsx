import React, { useState, useEffect } from "react";

const TemperatureRangeSelector = ({
  min,
  max,
  onChange,
  minLimit = -20,
  maxLimit = 50,
}) => {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);
  const [error, setError] = useState("");

  // Debounce input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localMin > localMax) {
        setError("Min temperature cannot be greater than max temperature.");
      } else {
        setError("");
        onChange("min", localMin);
        onChange("max", localMax);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localMin, localMax, onChange]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="font-medium text-gray-700 dark:text-gray-200">
        Temperature Range (°C)
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={localMin}
          onChange={(e) => setLocalMin(Number(e.target.value))}
          min={minLimit}
          max={localMax}
          className={`w-20 px-2 py-1 rounded border ${
            error ? "border-red-500" : "border-gray-300"
          } dark:bg-gray-800 dark:text-white`}
          placeholder="Min"
          title="Minimum temperature"
        />
        <span className="mx-1 text-gray-400">to</span>
        <input
          type="number"
          value={localMax}
          onChange={(e) => setLocalMax(Number(e.target.value))}
          min={localMin}
          max={maxLimit}
          className={`w-20 px-2 py-1 rounded border ${
            error ? "border-red-500" : "border-gray-300"
          } dark:bg-gray-800 dark:text-white`}
          placeholder="Max"
          title="Maximum temperature"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="flex gap-2 items-center mt-2">
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={localMin}
          onChange={(e) => setLocalMin(Number(e.target.value))}
          className="flex-1 accent-blue-500"
          title={`Minimum temperature: ${localMin}°C`}
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={localMax}
          onChange={(e) => setLocalMax(Number(e.target.value))}
          className="flex-1 accent-blue-500"
          title={`Maximum temperature: ${localMax}°C`}
        />
      </div>
    </div>
  );
};


export default TemperatureRangeSelector;
