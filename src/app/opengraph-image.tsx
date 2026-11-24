import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Muhammad Naufal Zakwan — Front-end Developer, Creative Thinker, Problem Solver";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const font = await readFile(join(process.cwd(), "public/fonts/anton/Anton-Regular.ttf"));
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "62px 70px", background: "#0c0c0c", color: "#f3f1ed" }}>
      <div style={{ display: "flex", fontSize: 25, color: "#d2ae83", letterSpacing: 4 }}>PERSONAL PORTFOLIO</div>
      <div style={{ display: "flex", flexDirection: "column", fontFamily: "Anton", fontSize: 100, lineHeight: 1.05 }}>
        <span>MUHAMMAD NAUFAL</span>
        <span style={{ color: "#d2ae83" }}>ZAKWAN</span>
      </div>
      <div style={{ display: "flex", fontSize: 23, color: "#b7b3ac" }}>Front-end Developer · Creative Thinker · Problem Solver</div>
    </div>,
    { ...size, fonts: [{ name: "Anton", data: font, weight: 400, style: "normal" }] },
  );
}
