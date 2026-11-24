import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTypewriterRhythm, memoryTypingDistance } from "./typewriter-rhythm";

export function createMemoryTypewriter(opening: HTMLElement) {
  const characters = [...opening.querySelectorAll<HTMLElement>("[data-typewriter-character]")];
  const machine = opening.querySelector<HTMLElement>("[data-typewriter-machine]")!;
  const heading = opening.querySelector<HTMLElement>("h3")!;
  const originalStyle = machine.getAttribute("style");
  const originalHeadingStyle = heading.getAttribute("style");
  const texture = opening.querySelector<SVGImageElement>("[data-typewriter-texture]");
  let textureObserver: IntersectionObserver | undefined;
  if (texture && !texture.hasAttribute("href")) {
    textureObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      texture.setAttribute("href", texture.getAttribute("data-typewriter-texture")!);
      textureObserver?.disconnect();
    }, { rootMargin: `${Math.round(innerHeight * 3)}px 0px` });
    textureObserver.observe(machine);
  }
  const state = { progress: 0 };
  const rhythm = createTypewriterRhythm(characters.map(character => character.textContent ?? ""));
  const keys = new Map([...opening.querySelectorAll<SVGGElement>("[data-typewriter-key]")]
    .map(key => [key.dataset.typewriterKey!, key]));
  let activeKey: SVGGElement | undefined;
  let previousCount = -1;
  function render() {
    const progress = gsap.utils.clamp(0, 1, state.progress);
    // Weighted character intervals leave room to read words and punctuation.
    // Key travel uses the same continuous, reversible scrubbed progress.
    const { count, depth } = rhythm(progress);
    const nextKey = depth > .001 ? keys.get(characters[count - 1]?.textContent?.toLowerCase() ?? "") : undefined;
    if (activeKey !== nextKey) {
      activeKey?.setAttribute("opacity", "0");
      activeKey = nextKey;
    }
    if (activeKey) {
      const y = Number(activeKey.dataset.keyY);
      activeKey.setAttribute("opacity", "1");
      activeKey.querySelector("[data-typewriter-keycap]")?.setAttribute("transform",
        `translate(0 ${y + depth * 10}) scale(1 ${1 - depth * .18}) translate(0 ${-y})`);
    }
    if (count !== previousCount) {
      previousCount = count;
      characters.forEach((character, index) => {
        character.toggleAttribute("data-untyped", index >= count);
        character.removeAttribute("data-typewriter-caret");
      });
      characters[Math.max(0, count - 1)]?.setAttribute("data-typewriter-caret", count ? "after" : "before");
      opening.dataset.typedCount = String(count);
    }
    // A small perspective settle reinforces depth without moving the composition.
    machine.style.setProperty("--typewriter-tilt", `${(3 * (1 - progress)).toFixed(3)}deg`);
  }
  function setScrollRange(start: number, end: number) {
    opening.dataset.typingStart = String(start);
    opening.dataset.typingEnd = String(end);
  }
  render();
  return { state, render, setScrollRange, heading,
    destroy() {
      textureObserver?.disconnect();
      keys.forEach(key => {
        key.setAttribute("opacity", "0");
        key.querySelector("[data-typewriter-keycap]")?.removeAttribute("transform");
      });
      characters.forEach(character => { character.removeAttribute("data-untyped"); character.removeAttribute("data-typewriter-caret"); });
      ["typedCount", "typingStart", "typingEnd"].forEach(key => delete opening.dataset[key]);
      if (originalStyle === null) machine.removeAttribute("style"); else machine.setAttribute("style", originalStyle);
      if (originalHeadingStyle === null) heading.removeAttribute("style"); else heading.setAttribute("style", originalHeadingStyle);
    },
  };
}

/** Only used when the shared Pisces pin is inactive; this is a sibling pin. */
export function createStandaloneMemoryTypewriter(opening: HTMLElement) {
  const typewriter = createMemoryTypewriter(opening);
  const typingDuration = memoryTypingDistance(innerHeight) / innerHeight;
  const entranceX = Math.min(60, Math.max(0,
    document.documentElement.clientWidth - typewriter.heading.getBoundingClientRect().right - 16));
  const timeline = gsap.timeline({ paused: true }).fromTo(typewriter.heading, {
    x: entranceX, autoAlpha: 0,
  }, { x: 0, autoAlpha: 1, duration: .12, ease: "power1.out" }, 0).to(typewriter.state, {
    progress: 1, duration: typingDuration, ease: "none", onUpdate: typewriter.render,
  }, .12).to({}, {duration: .12});
  ScrollTrigger.create({
    id: "memory-typewriter", trigger: opening, pin: true, start: "top top",
    end: () => `+=${Math.round(innerHeight * timeline.duration())}`, animation: timeline,
    scrub: .2, invalidateOnRefresh: true,
    onRefresh(self) {
      const unit = (self.end - self.start) / timeline.duration();
      typewriter.setScrollRange(self.start + .12 * unit, self.start + (.12 + typingDuration) * unit);
    },
  });
  return typewriter;
}
