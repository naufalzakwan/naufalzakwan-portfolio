import styles from "./pisces-story.module.css";

export const zodiacSigns = [
  { name: "Aries", symbol: "♈︎" }, { name: "Taurus", symbol: "♉︎" },
  { name: "Gemini", symbol: "♊︎" }, { name: "Cancer", symbol: "♋︎" },
  { name: "Leo", symbol: "♌︎" }, { name: "Virgo", symbol: "♍︎" },
  { name: "Libra", symbol: "♎︎" }, { name: "Scorpio", symbol: "♏︎" },
  { name: "Sagittarius", symbol: "♐︎" }, { name: "Capricorn", symbol: "♑︎" },
  { name: "Aquarius", symbol: "♒︎" }, { name: "Pisces", symbol: "♓︎" },
] as const;

// Stylized two-fish figure: western Circlet and northern fish joined at the knot.
// These are illustration coordinates, not a natal chart or measured sky positions.
const stars = [
  [196, 222], [224, 209], [247, 225], [240, 253], [213, 265], [190, 250],
  [282, 278], [310, 325], [346, 383], [382, 426], [398, 353], [409, 294],
  [419, 229], [419, 184], [395, 167], [375, 184], [387, 210],
];
const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
  [2, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
  [12, 13], [13, 14], [14, 15], [15, 16], [16, 12],
];

function polar(radius: number, degrees: number) {
  const angle = degrees * Math.PI / 180;
  return { x: 320 + Math.cos(angle) * radius, y: 320 + Math.sin(angle) * radius };
}

export function PiscesDiagram() {
  return (
    <figure className={styles.chart} data-pisces-chart>
      <svg aria-labelledby="pisces-diagram-title pisces-diagram-description" className={styles.svg} fill="none" role="img" viewBox="0 0 640 640">
        <title id="pisces-diagram-title">Roda zodiak dan ilustrasi konstelasi Pisces</title>
        <desc id="pisces-diagram-description">Dua rangkaian bintang terhubung membentuk dua ikan Pisces, dikelilingi dua belas simbol zodiak. Ilustrasi ini bukan bagan kelahiran pribadi.</desc>
        <g className={styles.foundation}>
          <circle cx="320" cy="320" data-pisces-draw="outer" r="288" />
          <path d="M32 320H608M320 32V608" data-pisces-draw="axes" />
          <circle cx="320" cy="320" data-pisces-draw="hub" r="64" />
        </g>
        <g className={styles.wheel}>
          <circle cx="320" cy="320" data-pisces-draw="ring" r="236" />
          <circle cx="320" cy="320" data-pisces-draw="ring" r="208" />
          {zodiacSigns.map((sign, index) => {
            const angle = -105 + index * 30;
            const outer = polar(288, angle), inner = polar(236, angle);
            return <path d={`M${inner.x} ${inner.y}L${outer.x} ${outer.y}`} data-pisces-draw="sector" key={sign.name} />;
          })}
          {Array.from({ length: 60 }, (_, index) => {
            const a = polar(236, index * 6), b = polar(index % 5 === 0 ? 225 : 231, index * 6);
            return <path className={styles.tick} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} data-pisces-draw="tick" key={index} />;
          })}
        </g>
        <g className={styles.glyphs}>
          {zodiacSigns.map((sign, index) => {
            const point = polar(262, -90 + index * 30);
            return <text className={sign.name === "Pisces" ? styles.piscesGlyph : undefined} data-pisces-glyph dominantBaseline="central" key={sign.name} textAnchor="middle" x={point.x} y={point.y}>{sign.symbol}</text>;
          })}
        </g>
        <g className={styles.constellation}>
          {connections.map(([a, b], index) => <path d={`M${stars[a][0]} ${stars[a][1]}L${stars[b][0]} ${stars[b][1]}`} data-pisces-draw="constellation" key={index} />)}
          {stars.map(([x, y], index) => <circle className={index === 9 ? styles.knot : undefined} cx={x} cy={y} data-pisces-star key={index} r={index === 9 ? 4 : 2.8} />)}
        </g>
        <g className={styles.diagramMark} data-pisces-mark>
          <text className={styles.innerGlyph} textAnchor="middle" x="250" y="430">♓︎</text>
          <text className={styles.diagramName} textAnchor="middle" x="320" y="520">PISCES</text>
        </g>
      </svg>
    </figure>
  );
}
