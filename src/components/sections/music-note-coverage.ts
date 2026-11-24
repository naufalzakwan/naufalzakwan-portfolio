type SurfaceProfile = {
  width: number;
  height: number;
  halfWidths: Float64Array;
};

// Measure solid material around the image's centre, where the zoom is anchored.
// Each entry describes the widest opaque rectangle at that half-height.
export function measureNoteSurface(pixels: Uint8ClampedArray, width: number, height: number): SurfaceProfile {
  const centreX = Math.floor(width / 2);
  const centreY = Math.floor(height / 2);
  const halfWidths = new Float64Array(Math.min(centreY, height - centreY));
  let halfWidth = Math.min(centreX, width - centreX);
  for (let radius = 0; radius < halfWidths.length; radius++) {
    for (const row of [centreY - radius - 1, centreY + radius]) {
      let left = centreX;
      let right = centreX;
      // The original WebP material has alpha 250–254, even away from edges.
      while (left > 0 && pixels[(row * width + left - 1) * 4 + 3] >= 250) left--;
      while (right < width && pixels[(row * width + right) * 4 + 3] >= 250) right++;
      halfWidth = Math.min(halfWidth, centreX - left, right - centreX);
    }
    halfWidths[radius] = halfWidth;
  }
  return { width, height, halfWidths };
}

export function getNoteCoverScale(surface: SurfaceProfile, imageWidth: number, viewportWidth: number, viewportHeight: number) {
  let low = 0;
  let high = surface.halfWidths.length;
  const ratio = viewportWidth / viewportHeight;
  // Find the largest centred rectangle with the viewport's aspect ratio.
  // Integer row bounds keep every viewport corner inside fully opaque pixels.
  for (let step = 0; step < 32; step++) {
    const halfHeight = (low + high) / 2;
    // Keep half a source pixel inside the silhouette for bilinear sampling.
    const row = Math.max(0, Math.ceil(halfHeight + 0.5) - 1);
    const availableWidth = (surface.halfWidths[row] ?? 0) - 0.5;
    if (halfHeight * ratio <= availableWidth) low = halfHeight;
    else high = halfHeight;
  }
  return low > 0 ? Math.max(1, viewportHeight / (2 * low * imageWidth / surface.width)) : 1;
}
