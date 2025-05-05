import React, { useState, useEffect, useRef } from "react";

const LocationSelector = ({ locations, onSelect, onDetectLocation }) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const filtered = locations.filter((loc) =>
    loc.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filtered.length);
      ensureHighlightedItemVisible();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + filtered.length) % filtered.length
      );
      ensureHighlightedItemVisible();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        onSelect(filtered[highlightedIndex].name);
        setIsOpen(false);
        setSearch(filtered[highlightedIndex].name);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Ensure the highlighted item is visible in the scrollable list
  const ensureHighlightedItemVisible = () => {
    if (listRef.current && highlightedIndex >= 0) {
      const highlightedItem = listRef.current.children[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  };

  // Handle geolocation detection
  const handleDetectLocation = () => {
    if (!onDetectLocation) return;
    setLoading(true);
    onDetectLocation();
    setTimeout(() => setLoading(false), 2000);
  };

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full relative">
      <label
        htmlFor="location-input"
        className="font-medium text-gray-700 dark:text-gray-200"
      >
        Location
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id="location-input"
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city..."
          aria-autocomplete="list"
          aria-controls="location-listbox"
          aria-expanded={isOpen}
          aria-activedescendant={
            highlightedIndex >= 0
              ? `location-option-${highlightedIndex}`
              : undefined
          }
          className="flex-1 px-2 py-1 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
          autoComplete="off"
        />
        {onDetectLocation && (
          <button
            onClick={handleDetectLocation}
            type="button"
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            title="Detect my location"
            disabled={loading}
          >
            {loading ? "⏳" : "📍"}
          </button>
        )}
      </div>
      {isOpen && filtered.length > 0 && (
        <ul
          ref={listRef}
          id="location-listbox"
          role="listbox"
          className="absolute z-10 mt-12 max-h-48 w-full overflow-auto rounded border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          {filtered.map((loc, idx) => (
            <li
              key={loc.name}
              id={`location-option-${idx}`}
              role="option"
              aria-selected={highlightedIndex === idx}
              className={`cursor-pointer px-3 py-1 ${
                highlightedIndex === idx
                  ? "bg-blue-600 text-white"
                  : "text-gray-900 dark:text-gray-100"
              }`}
              onMouseDown={() => {
                onSelect(loc.name);
                setIsOpen(false);
                setSearch(loc.name);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              {loc.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSelector;
