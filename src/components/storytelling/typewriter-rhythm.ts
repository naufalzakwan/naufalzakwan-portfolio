// Shared by the main Pisces timeline and the compact-screen fallback.
export function memoryTypingDistance(viewportHeight: number) {
  return Math.max(1800, viewportHeight * 3.6);
}

export function createTypewriterRhythm(characters: readonly string[]) {
  let units = 0;
  const revealAt = characters.map((character) => {
    const reveal = units + 1;
    // Holds consume scroll distance, so they reverse without timers or locks.
    units += /[.!?…]/u.test(character) ? 7 : /[,;:]/u.test(character) ? 4 : /\s/u.test(character) ? 1.8 : 1;
    return reveal;
  });
  const total = units + 1;

  return (progress: number) => {
    const position = Math.max(0, Math.min(1, progress)) * total;
    let low = 0, high = revealAt.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (revealAt[middle] <= position) low = middle + 1;
      else high = middle;
    }
    const stroke = low ? Math.max(0, Math.min(1, (position - revealAt[low - 1]) / .75)) : 0;
    return { count: low, depth: Math.sin(Math.PI * stroke) };
  };
}
