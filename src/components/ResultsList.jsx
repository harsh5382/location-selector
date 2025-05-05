import React from "react";
import ResultItem from "./ResultItem";

const ResultsList = ({ results, loading }) => (
  <div
    className="w-full max-w-2xl mx-auto mt-6"
    role="region"
    aria-live="polite"
    aria-busy={loading}
  >
    {loading ? (
      <div className="text-center text-blue-500 py-8 animate-pulse">
        Loading results...
      </div>
    ) : results && results.length > 0 ? (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700" role="list">
        {results.map((item, idx) => (
          <ResultItem key={idx} item={item} />
        ))}
      </ul>
    ) : (
      <div className="text-center text-gray-400 py-8">
        No locations found matching your criteria.
      </div>
    )}
  </div>
);

export default ResultsList;
