import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cancelPageScrollMomentum, scrollPageTo } from "@/lib/smooth-scroll";
import { addMemoriesReading, addMemoriesGalleryEntrance, memoriesReadingDistance } from "./memories-reading";

/** ScrollTrigger disables native smooth scrolling globally when snap is added.
 * Our scoped CSS already does that during the pull; preserve navigation outside it. */
export function createMemoryOrbitTrigger(options: ScrollTrigger.StaticVars) {
  const originals = [document.documentElement, document.body].map(element => ({
    element, value: element.style.getPropertyValue("scroll-behavior"),
    priority: element.style.getPropertyPriority("scroll-behavior"),
  }));
  const trigger = ScrollTrigger.create(options);
  originals.forEach(({element, value, priority}) => {
    if (value) element.style.setProperty("scroll-behavior", value, priority);
    else element.style.removeProperty("scroll-behavior");
  });
  return trigger;
}

/** Hold the previously settled photo inside the 45–55% deadband, in either direction. */
export function magneticMemoryTarget(phase: number, settled: number, count: number) {
  const lower = Math.floor(phase), fraction = phase - lower;
  const target = fraction < .45 ? lower : fraction > .55 ? lower + 1
    : settled === lower || settled === lower + 1 ? settled : Math.round(phase);
  return gsap.utils.clamp(0, count - 1, target);
}

export function createMemoriesOrbit(intro: HTMLElement, standalone = false) {
  const root = intro.querySelector<HTMLElement>("[data-memory-orbit]")!;
  const stage = root.querySelector<HTMLElement>("[data-memory-carousel]")!;
  const cards = [...root.querySelectorAll<HTMLElement>("[data-memory-card]")];
  const svg = root.querySelector<SVGSVGElement>("[data-memory-orbit-ticks]")!;
  const status = root.querySelector<HTMLElement>("[data-memory-status]")!;
  const saved = [intro, root, ...cards].map(element => ({ element, style: element.getAttribute("style") }));
  const state = { phase: 0 };
  let settled = 0, startScroll = 0, endScroll = 0, active = -1;
  const width = document.documentElement.clientWidth;
  if (standalone) {
    intro.dataset.orbitStandalone = "";
    intro.style.setProperty("--orbit-viewport-width", `${width}px`);
    intro.style.setProperty("--orbit-viewport-height", `${innerHeight}px`);
  }
  root.dataset.orbitMotion = "active";
  root.style.setProperty("--orbit-width", `${width}px`);
  const height = stage.clientHeight;
  const maxRatio = Math.max(...cards.map(card => {
    const [w, h] = getComputedStyle(card).aspectRatio.split("/").map(Number);
    return w / h;
  }));
  const cardHeight = Math.min(560, height * .76, width * .76 / maxRatio);
  root.style.setProperty("--orbit-card-height", `${cardHeight}px`);
  const stepAngle = .55;
  const radiusX = width * (width < 600 ? .8 : width < 896 ? .65 : .43) / Math.sin(stepAngle);
  const radiusY = radiusX * .74;
  const focusY = cardHeight / 2 + 18;
  gsap.set(cards, { xPercent: -50, yPercent: -50, transformOrigin: "50% 50%", scale: 1 });
  // Reuse setters on compact screens instead of allocating five zero-duration
  // tweens per frame. GSAP still owns its transform cache for the shared-photo
  // handoff, including when the same card returns while scrolling backward.
  const setters = width < 896 ? cards.map(card => ({
    x: gsap.quickSetter(card, "x", "px"),
    y: gsap.quickSetter(card, "y", "px"),
    rotation: gsap.quickSetter(card, "rotation", "deg"),
    opacity: gsap.quickSetter(card, "opacity"),
    zIndex: gsap.quickSetter(card, "zIndex"),
  })) : undefined;

  // Equal arc-length sampling keeps ticks evenly spaced, including at the edges.
  const limit = Math.asin(Math.min(.99, (width / 2 + 30) / radiusX));
  const apex = focusY + cardHeight * .24;
  let previousX = 0, previousY = 0, travelled = 0;
  const ticks: string[] = [];
  for (let i = 0; i <= 600; i++) {
    const angle = -limit + 2 * limit * i / 600;
    const x = width / 2 + radiusX * Math.sin(angle);
    const y = apex + radiusY * (1 - Math.cos(angle));
    if (i) travelled += Math.hypot(x - previousX, y - previousY);
    previousX = x; previousY = y;
    if (i && travelled < 9) continue;
    travelled %= 9;
    const nx = radiusY * Math.sin(angle), ny = -radiusX * Math.cos(angle);
    const length = (width < 600 ? 10 : 15) / Math.hypot(nx, ny);
    ticks.push(`M${x.toFixed(2)},${y.toFixed(2)}l${(nx * length).toFixed(2)},${(ny * length).toFixed(2)}`);
  }
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", ticks.join("")); svg.replaceChildren(path);

  function render() {
    cards.forEach((card, index) => {
      // Continue the same arc from the final preview to photo 01 before its
      // story. Reposition the offscreen first card only at zero opacity.
      const virtualIndex = index === 0 && state.phase > 2.5 ? cards.length : index;
      const relative = virtualIndex - state.phase;
      const distance = Math.abs(relative);
      const angle = gsap.utils.clamp(-1.4, 1.4, relative * stepAngle);
      const pose = {
        x: radiusX * Math.sin(angle), y: focusY + radiusY * (1 - Math.cos(angle)),
        rotation: gsap.utils.clamp(-42, 42, Math.atan2(radiusY * Math.sin(angle), radiusX * Math.cos(angle)) * 180 / Math.PI),
        scale: 1,
        opacity: gsap.utils.clamp(0, 1, 2.5 - distance), zIndex: 10 - Math.round(distance * 2),
      };
      const setter = setters?.[index];
      if (setter) {
        // Match CSSPlugin's coordinate precision; rotation retains its endpoint.
        setter.x(Math.round(pose.x * 10000) / 10000);
        setter.y(Math.round(pose.y * 10000) / 10000);
        setter.rotation(pose.rotation);
        setter.opacity(Math.round(pose.opacity * 10000) / 10000); setter.zIndex(pose.zIndex);
      } else gsap.set(card, pose);
    });
    const index = Math.round(state.phase) % cards.length;
    if (active !== index) {
      active = index;
      cards.forEach((card, i) => card.setAttribute("aria-current", String(i === index)));
      root.dataset.activeMemory = String(index + 1);
    }
    if (Math.abs(state.phase - Math.round(state.phase)) < .002) {
      settled = index;
      const text = `Foto ${index + 1} dari ${cards.length}`;
      if (status.textContent !== text) status.textContent = text;
    }
    root.dataset.orbitPhase = state.phase.toFixed(4);
  }
  function setScrollRange(start: number, end: number) {
    startScroll = start; endScroll = end;
    root.dataset.orbitScrollStart = String(start);
    root.dataset.orbitScrollEnd = String(end);
  }
  function keydown(event: KeyboardEvent) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === "Home" ? 0 : event.key === "End" ? cards.length - 1
      : gsap.utils.clamp(0, cards.length - 1, Math.round(state.phase) % cards.length + (event.key === "ArrowRight" ? 1 : -1));
    // A single keyboard action changes the same scroll source as touch/wheel.
    scrollPageTo(startScroll + index / (cards.length - 1) * (endScroll - startScroll));
  }
  stage.addEventListener("keydown", keydown);
  render();
  return {
    state, render, count: cards.length, setScrollRange,
    snap(start: number, end: number, duration: () => number) {
      return {
        inertia: false, directional: false, delay: .22,
        duration: { min: .4, max: .75 }, ease: "power3.out",
        onStart() { cancelPageScrollMomentum(); root.dataset.orbitSnapping = ""; },
        onInterrupt() { delete root.dataset.orbitSnapping; },
        onComplete() { delete root.dataset.orbitSnapping; },
        snapTo(progress: number) {
          const time = progress * duration();
          if (time < start || time > end) return progress;
          const target = magneticMemoryTarget((time - start) / (end - start) * (cards.length - 1), settled, cards.length);
          return (start + target / (cards.length - 1) * (end - start)) / duration();
        },
      };
    },
    destroy() {
      stage.removeEventListener("keydown", keydown);
      svg.replaceChildren(); svg.removeAttribute("viewBox"); status.textContent = "";
      delete intro.dataset.orbitStandalone;
      ["orbitMotion", "orbitSnapping", "activeMemory", "orbitPhase", "orbitScrollStart", "orbitScrollEnd"].forEach(key => delete root.dataset[key]);
      cards.forEach(card => card.removeAttribute("aria-current"));
      saved.forEach(({element, style}) => { if (style === null) element.removeAttribute("style"); else element.setAttribute("style", style); });
    },
  };
}

/** Used only when the shared Pisces pin cannot fit; never nested inside it. */
export function createStandaloneMemoriesOrbit(intro: HTMLElement) {
  const orbit = createMemoriesOrbit(intro, true);
  const step = Math.max(280, Math.min(560, innerHeight * .6));
  const readingStart = 0;
  const readingDuration = memoriesReadingDistance(intro, innerHeight) / step;
  const galleryEntry = readingStart + readingDuration + Math.max(280, innerHeight * .35) / step;
  const galleryDuration = innerHeight * .65 / step;
  const entry = galleryEntry + galleryDuration + .25, end = entry + orbit.count - 1;
  const timeline = gsap.timeline({ paused: true });
  const reading = addMemoriesReading(timeline, intro, readingStart, readingDuration);
  const galleryEntrance = addMemoriesGalleryEntrance(timeline, intro, innerHeight, galleryEntry, galleryDuration);
  timeline.to(orbit.state, {
    phase: orbit.count - 1, duration: orbit.count - 1, ease: "none", onUpdate: orbit.render,
  }, entry).to(orbit.state, {
    // Match the shared scene's sixth presentation: photo 01 returns along
    // the same arc after photo 05, with no pause or extra DOM photo.
    phase: orbit.count, duration: 1, ease: "none", onUpdate: orbit.render,
  }, end).to({}, {duration: .4});
  const publish = (self: ScrollTrigger) => {
    const unit = (self.end - self.start) / timeline.duration();
    orbit.setScrollRange(self.start + entry * unit, self.start + end * unit);
    reading.setScrollRange(self.start + readingStart * unit, self.start + (readingStart + readingDuration) * unit);
    galleryEntrance.setScrollRange(self.start + galleryEntry * unit, self.start + (galleryEntry + galleryDuration) * unit);
  };
  createMemoryOrbitTrigger({
    id: "memories-orbit", trigger: intro, pin: true, start: "top top",
    end: `+=${timeline.duration() * step}`, animation: timeline, scrub: .4,
    snap: orbit.snap(entry, end, () => timeline.duration()), onRefresh: publish,
  });
  timeline.eventCallback("onUpdate", () => { reading.render(); galleryEntrance.render(); });
  return { ...orbit, destroy() { reading.destroy(); galleryEntrance.destroy(); orbit.destroy(); } };
}
