/** Ignore small touch-browser toolbar resizes without rebuilding pinned scenes.
 * Keep the last accepted size so a cumulative height change still rebuilds.
 * Width/orientation changes and desktop resizing retain the normal callback.
 */
export function createViewportResizeHandler(rebuild: () => void) {
  let width = window.innerWidth;
  let height = window.innerHeight;
  return () => {
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    if (nextWidth === width && Math.abs(nextHeight - height) < 80
      && window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
    width = nextWidth;
    height = nextHeight;
    rebuild();
  };
}
