import React, { useState, useEffect } from "react";

const DistanceSelector = ({
  distances = [50, 100, 250, 500],
  value,
  onSelect,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const min = Math.min(...distances);
  const max = Math.max(...distances);
  const step = distances.length > 1 ? distances[1] - distances[0] : 50;

  // Tooltip position state
  const [tooltipPos, setTooltipPos] = useState(0);

  useEffect(() => {
    if (value !== undefined) {
      const percent = ((value - min) / (max - min)) * 100;
      setTooltipPos(percent);
    }
  }, [value, min, max]);

  return (
    <div className="flex flex-col gap-2 w-full relative">
      <label
        htmlFor="distance-slider"
        className="font-medium text-gray-700 dark:text-gray-200"
      >
        Distance Range (km): <span className="font-bold">{value || min}</span>
      </label>
      <input
        id="distance-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || min}
        onChange={(e) => onSelect(Number(e.target.value))}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-full accent-blue-500"
      />
      {showTooltip && (
        <div
          className="absolute -top-6 bg-blue-600 text-white text-xs rounded px-2 py-1 select-none"
          style={{ left: `calc(${tooltipPos}% - 1rem)` }}
        >
          {value} km
        </div>
      )}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min} km</span>
        <span>{max} km</span>
      </div>
    </div>
  );
};

export default DistanceSelector;
