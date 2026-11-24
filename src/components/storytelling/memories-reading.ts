import gsap from "gsap";
import { createTypewriterRhythm } from "./typewriter-rhythm";

export function memoriesReadingDistance(intro: HTMLElement, height: number) {
  return Math.max(height * 2.8, intro.querySelectorAll("[data-memory-reading-character]").length * 22);
}

/** The existing scene holds the text centrally; photos enter only after reading. */
export function addMemoriesGalleryEntrance(timeline: gsap.core.Timeline, intro: HTMLElement, height: number, start: number, duration: number) {
  const paragraph = intro.querySelector<HTMLElement>("[data-memory-reading]")!;
  const gallery = intro.querySelector<HTMLElement>("[data-memory-orbit]")!;
  const originalInert = gallery.inert;
  const centerOffset = height / 2 - paragraph.offsetTop - paragraph.offsetHeight / 2;
  gsap.set(paragraph, { y: centerOffset });
  gsap.set(gallery, { y: height, autoAlpha: 0 });
  timeline.to(paragraph, { y: 0, duration, ease: "power1.inOut" }, start)
    .to(gallery, { y: 0, autoAlpha: 1, duration, ease: "power1.inOut" }, start);
  function render() { gallery.inert = timeline.time() <= start; }
  render();
  return { render,
    setScrollRange(start: number, end: number) {
      intro.dataset.galleryEntryStart = String(start);
      intro.dataset.galleryEntryEnd = String(end);
    },
    destroy() {
      gallery.inert = originalInert;
      delete intro.dataset.galleryEntryStart; delete intro.dataset.galleryEntryEnd;
    },
  };
}

/** Keep the complete paragraph in flow: only ink and a tiny key strike change. */
export function addMemoriesReading(timeline: gsap.core.Timeline, intro: HTMLElement, start: number, duration: number) {
  const paragraph = intro.querySelector<HTMLElement>("[data-memory-reading]")!;
  const characters = [...paragraph.querySelectorAll<HTMLElement>("[data-memory-reading-character]")];
  const rhythm = createTypewriterRhythm(characters.map(character => character.textContent ?? ""));
  const state = { progress: 0 };
  let previousCount = -1;
  let striking: HTMLElement | undefined;
  function render() {
    const { count, depth } = rhythm(state.progress);
    if (count !== previousCount) {
      previousCount = count;
      characters.forEach((character, index) => {
        character.toggleAttribute("data-memory-untyped", index >= count);
        character.removeAttribute("data-memory-caret");
      });
      characters[Math.max(0, count - 1)]?.setAttribute("data-memory-caret", count ? "after" : "before");
      paragraph.dataset.readingCount = String(count);
    }
    const next = count > 0 && depth > .001 ? characters[count - 1] : undefined;
    if (striking !== next) {
      striking?.removeAttribute("data-memory-striking");
      striking?.style.removeProperty("--memory-strike");
      striking = next;
      striking?.setAttribute("data-memory-striking", "");
    }
    striking?.style.setProperty("--memory-strike", depth.toFixed(3));
  }
  render();
  timeline.to(state, { progress: 1, duration, ease: "none", onUpdate: render }, start);
  return { render,
    setScrollRange(start: number, end: number) {
      paragraph.dataset.readingStart = String(start);
      paragraph.dataset.readingEnd = String(end);
    },
    destroy() {
      characters.forEach(character => {
        ["data-memory-untyped", "data-memory-caret", "data-memory-striking"].forEach(attribute => character.removeAttribute(attribute));
        character.style.removeProperty("--memory-strike");
      });
      ["readingCount", "readingStart", "readingEnd"].forEach(key => delete paragraph.dataset[key]);
    },
  };
}
