const SkeletonLoader = ({ type = "box", count = 3 }) => {
  const styles = {
    box: "h-32 w-full bg-gray-200 animate-pulse rounded-xl mb-4",
    line: "h-4 w-full bg-gray-200 animate-pulse mb-2 rounded",
    card: "h-48 bg-gray-200 animate-pulse rounded-lg",
  };

  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles[type]} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
