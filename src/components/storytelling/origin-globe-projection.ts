import { originFrames } from "@/data/origin-globe";

type Coordinate = [number, number];
export type OriginMap = { world: Coordinate[][]; region: Coordinate[][]; target: Coordinate[][] };
export type SphereLine = Float32Array;
const radians = Math.PI / 180;

export function sphereLines(lines: Coordinate[][]): SphereLine[] {
  return lines.map(line => {
    const vertices = new Float32Array(line.length * 3);
    line.forEach(([longitude, latitude], index) => {
      const lon = longitude * radians, lat = latitude * radians;
      vertices.set([Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)], index * 3);
    });
    return vertices;
  });
}

export function originCamera(progress: number) {
  const end = originFrames.findIndex(frame => frame.at > progress);
  const index = end < 0 ? originFrames.length - 2 : Math.max(0, end - 1);
  const from = originFrames[index], to = originFrames[index + 1];
  const fraction = Math.max(0, Math.min(1, (progress - from.at) / (to.at - from.at)));
  const eased = fraction * fraction * (3 - 2 * fraction);
  const mix = (a: number, b: number) => a + (b - a) * eased;
  return {
    longitude: mix(from.longitude, to.longitude), latitude: mix(from.latitude, to.latitude),
    // Interpolate the zoom logarithmically for a constant perceived approach.
    zoom: Math.exp(mix(Math.log(from.zoom), Math.log(to.zoom))),
    lines: mix(from.lines, to.lines), marker: mix(from.marker, to.marker),
    label: progress === 1 ? to.label : from.label,
  };
}

// Orthographic projection: longitude changes rotate a sphere in depth, not a
// flat image. Positive z is the visible hemisphere; back-facing lines are cut.
export function sphereProjection(longitude: number, latitude: number) {
  const lon = longitude * radians, lat = latitude * radians;
  const sinLon = Math.sin(lon), cosLon = Math.cos(lon), sinLat = Math.sin(lat), cosLat = Math.cos(lat);
  return (x: number, y: number, z: number): [number, number, number] => {
    const facing = cosLon * x + sinLon * y;
    return [-sinLon * x + cosLon * y, sinLat * facing - cosLat * z, cosLat * facing + sinLat * z];
  };
}

export function strokeSphereLines(context: CanvasRenderingContext2D, lines: SphereLine[], project: ReturnType<typeof sphereProjection>, radius: number, cx: number, cy: number) {
  context.beginPath();
  for (const line of lines) {
    let previous: [number, number, number] | undefined;
    for (let i = 0; i < line.length; i += 3) {
      const point = project(line[i], line[i + 1], line[i + 2]);
      if (previous) {
        if (previous[2] >= 0 && point[2] >= 0) {
          context.moveTo(cx + previous[0] * radius, cy + previous[1] * radius);
          context.lineTo(cx + point[0] * radius, cy + point[1] * radius);
        } else if ((previous[2] >= 0) !== (point[2] >= 0)) {
          // Clip crossing segments at the horizon instead of joining continents
          // through the invisible side of the earth.
          const t = previous[2] / (previous[2] - point[2]);
          const edge = [previous[0] + (point[0] - previous[0]) * t, previous[1] + (point[1] - previous[1]) * t];
          const visible = previous[2] >= 0 ? previous : point;
          context.moveTo(cx + visible[0] * radius, cy + visible[1] * radius);
          context.lineTo(cx + edge[0] * radius, cy + edge[1] * radius);
        }
      }
      previous = point;
    }
  }
  context.stroke();
}
