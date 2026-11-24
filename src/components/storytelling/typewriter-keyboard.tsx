import { useId } from "react";

export const typewriterAsset = "/images/story/memories/typewriter-transparent.webp";

// Keycap bounds in the original 1440 × 960 render. Cropping the same texture
// keeps the mechanical overlay consistent with the photographed keyboard.
const rows = [
  { letters: "qwertyuiop", centers: [395, 462, 527, 592, 657, 722, 787, 852, 917, 982], y: 587 },
  { letters: "asdfghjkl", centers: [414, 480, 546, 611, 676, 742, 807, 872, 938], y: 641 },
  { letters: "zxcvbnm", centers: [445, 511, 577, 642, 708, 773, 839], y: 699 },
];
const keys = rows.flatMap(row => Array.from(row.letters, (letter, index) => ({
  letter, x: row.centers[index] - 26, y: row.y, width: 52, height: 54,
})));
keys.push({ letter: " ", x: 367, y: 765, width: 707, height: 63 });

export function TypewriterKeyboard() {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 960" data-typewriter-keyboard>
      <defs>
        <image id={`${id}-texture`} data-typewriter-texture={typewriterAsset} width="1440" height="960" />
        {keys.map((key, index) => <clipPath id={`${id}-${index}`} key={key.letter}>
          <rect x={key.x} y={key.y} width={key.width} height={key.height} rx="13" />
        </clipPath>)}
      </defs>
      {keys.map((key, index) => (
        <g key={key.letter} data-typewriter-key={key.letter} data-key-y={key.y} opacity="0">
          <rect x={key.x} y={key.y} width={key.width} height={key.height} rx="13" fill="#14130f" />
          <g data-typewriter-keycap>
            <use href={`#${id}-texture`} clipPath={`url(#${id}-${index})`} />
          </g>
        </g>
      ))}
    </svg>
  );
}
