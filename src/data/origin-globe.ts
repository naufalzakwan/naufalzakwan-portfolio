export const birthplace = { longitude: 109.3425, latitude: -0.0263 } as const;

export const originRotation = {
  revealStart: .12, takeOver: .45, settleAt: .52,
  degreesPerSecond: 2, desktopFps: 60, compactFps: 30,
} as const;

// The camera moves continuously between these editorial beats. Zoom is a
// multiplier of the initial globe radius, not an unrelated 2D map transition.
export const originFrames = [
  { at: 0, longitude: -45, latitude: 18, zoom: 1, lines: 0, marker: 0, label: "Dunia" },
  { at: .12, longitude: -45, latitude: 18, zoom: 1, lines: 0, marker: 0, label: "Dunia" },
  { at: .26, longitude: 12, latitude: 14, zoom: 1, lines: .35, marker: 0, label: "Dunia" },
  { at: .4, longitude: 75, latitude: 10, zoom: 1, lines: .85, marker: 0, label: "Dunia" },
  { at: .52, longitude: 108, latitude: 5, zoom: 1.15, lines: 1, marker: 0, label: "Asia Tenggara" },
  { at: .63, longitude: 116, latitude: -2, zoom: 2.8, lines: 1, marker: 0, label: "Indonesia" },
  { at: .73, longitude: 113, latitude: .5, zoom: 5.5, lines: 1, marker: 0, label: "Kalimantan" },
  { at: .84, longitude: 111, latitude: .3, zoom: 10, lines: 1, marker: 0, label: "Kalimantan Barat" },
  { at: .94, ...birthplace, zoom: 22, lines: 1, marker: 0, label: "Pontianak" },
  { at: 1, ...birthplace, zoom: 22, lines: 1, marker: 1, label: "Pontianak" },
] as const;
