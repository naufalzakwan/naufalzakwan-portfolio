import gsap from "gsap";

/** Move the original gallery node, without cloning/reloading its image. */
export function createSharedMemoryPhoto(viewport: HTMLElement, card: HTMLElement, target: HTMLElement, renderOrbit: () => void) {
  const chapter = target.closest<HTMLElement>("[data-memory-chapter]")!;
  if (card.dataset.memoryId !== chapter.dataset.memoryId) throw new Error("Memory photo and story IDs must match");
  const originalParent = card.parentElement!;
  const nextSibling = card.nextSibling;
  const targetImage = target.querySelector<HTMLElement>("img, [role=img]")!;
  const saved = [card, targetImage, target].map(element => ({ element, style: element.getAttribute("style") }));
  const origin = viewport.getBoundingClientRect();
  const start = card.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  const from = { x: start.left - origin.left, y: start.top - origin.top };
  const to = { x: end.left - origin.left, y: end.top - origin.top };
  const radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
  const layer = document.createElement("div");
  layer.dataset.memorySharedLayer = card.dataset.memoryId;
  Object.assign(layer.style, { position: "absolute", inset: "0", pointerEvents: "none", zIndex: "20" });
  viewport.appendChild(layer);
  targetImage.style.visibility = "hidden";
  target.style.background = "transparent";
  const state = { progress: 0 };
  let mode = "gallery", previous = -1;

  function render() {
    const p = gsap.utils.clamp(0, 1, state.progress);
    if (p === previous) return;
    previous = p;
    if (p <= 0) {
      if (mode !== "gallery") {
        originalParent.insertBefore(card, nextSibling);
        if (saved[0].style === null) card.removeAttribute("style"); else card.setAttribute("style", saved[0].style);
        gsap.set(card, { xPercent: -50, yPercent: -50, transformOrigin: "50% 50%", scaleX: 1, scaleY: 1 });
        renderOrbit();
        mode = "gallery";
      }
      return;
    }
    if (p >= 1) {
      if (mode !== "detail") {
        target.appendChild(card);
        gsap.set(card, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none",
          x: 0, y: 0, xPercent: 0, yPercent: 0, scaleX: 1, scaleY: 1, rotation: 0,
          borderRadius: radius, borderWidth: 0, boxShadow: "none", transformOrigin: "0 0", opacity: 1 });
        mode = "detail";
      }
      return;
    }
    if (mode !== "shared") { layer.appendChild(card); mode = "shared"; }
    const scaleX = 1 + (end.width / start.width - 1) * p;
    const scaleY = 1 + (end.height / start.height - 1) * p;
    gsap.set(card, { position: "absolute", left: 0, top: 0, maxWidth: "none", width: start.width, height: start.height,
      x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p,
      xPercent: 0, yPercent: 0, scaleX, scaleY, rotation: 0, opacity: 1, transformOrigin: "0 0",
      borderRadius: radius / scaleX, borderWidth: 1 - p, boxShadow: `0 ${18 * (1 - p)}px ${38 * (1 - p)}px #0005` });
  }
  return { state, render, destroy() {
    originalParent.insertBefore(card, nextSibling);
    saved.forEach(({element, style}) => { if (style === null) element.removeAttribute("style"); else element.setAttribute("style", style); });
    layer.remove();
  } };
}
