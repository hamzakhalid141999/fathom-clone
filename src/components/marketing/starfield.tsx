/** Deterministic so server and client render the same dots. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const stars = (() => {
  const random = seededRandom(20260912);
  return Array.from({ length: 140 }, () => ({
    top: random() * 100,
    left: random() * 100,
    size: random() < 0.82 ? 1 : 2,
    opacity: 0.12 + random() * 0.68,
  }));
})();

export function Starfield() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
