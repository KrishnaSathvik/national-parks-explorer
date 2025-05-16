import React from "react";

const SkeletonLoader = ({ type = "box", count = 3, className = "" }) => {
  const baseStyles = {
    box: "h-32 w-full bg-gray-200 animate-pulse rounded-xl mb-4",
    line: "h-4 w-full bg-gray-200 animate-pulse mb-2 rounded",
    card: "h-48 bg-gray-200 animate-pulse rounded-lg",
  };

  const selectedStyle = baseStyles[type] || baseStyles.box;

  return (
    <div role="status" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${selectedStyle} ${className}`} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
