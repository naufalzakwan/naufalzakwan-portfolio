import gsap from "gsap";

// Reuse the existing chapter geometry inside the shared journey viewport.
// This controller owns no pin: its timeline is appended to the master timeline.
export function createSharedChapters(root: HTMLElement, height: number) {
  const stage = root.querySelector<HTMLElement>("[data-memory-stage]")!;
  const stack = root.querySelector<HTMLElement>("[data-memory-stack]")!;
  const chapters = [...root.querySelectorAll<HTMLElement>("[data-memory-chapter]")];
  const contents = [...root.querySelectorAll<HTMLElement>("[data-memory-content]")];
  const copies = [...root.querySelectorAll<HTMLElement>("[data-memory-copy]")];
  const elements = [root, stage, stack, ...chapters, ...contents];
  const styles = elements.map((element) => element.getAttribute("style"));
  const attributes = chapters.map((chapter) => ({ hidden: chapter.getAttribute("aria-hidden"), inert: chapter.inert }));
  const originalInert = root.inert;
  const desktop = innerWidth >= 896;
  root.dataset.motion = "active";
  root.style.setProperty("--memory-stage-height", `${height}px`);
  const copyHeight = Math.max(...copies.map((copy) => copy.offsetHeight));
  const photoHeight = desktop ? Math.min(height - 80, 720) : Math.min(height * .46, height - copyHeight - 88, 420);
  function restore() {
    delete root.dataset.motion;
    root.inert = originalInert;
    elements.forEach((element, index) => {
      if (styles[index] === null) element.removeAttribute("style");
      else element.setAttribute("style", styles[index]!);
    });
    chapters.forEach((chapter, index) => {
      chapter.inert = attributes[index].inert;
      if (attributes[index].hidden === null) chapter.removeAttribute("aria-hidden");
      else chapter.setAttribute("aria-hidden", attributes[index].hidden!);
    });
  }
  if (photoHeight < 190 || copyHeight > height - 64) { restore(); return; }
  root.style.setProperty("--memory-photo-height", `${photoHeight}px`);
  const contentHeight = desktop ? Math.max(photoHeight, copyHeight) : photoHeight + copyHeight + 24;
  root.style.setProperty("--memory-content-height", `${contentHeight}px`);
  chapters.forEach((chapter, index) => gsap.set(chapter, { zIndex: index + 1 }));
  contents.forEach((content, index) => gsap.set(content, { yPercent: index === 0 ? 0 : 100 }));
  if (!desktop) gsap.set(contents, { alignContent: "start", alignItems: "start", gridTemplateRows: `${photoHeight}px ${copyHeight}px`, rowGap: 24 });
  const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  for (let index = 1; index < chapters.length; index++) timeline.to(contents[index], { yPercent: 0, duration: 1 }, index - 1);
  function syncActive() {
    const active = Math.min(chapters.length - 1, Math.floor(timeline.progress() * (chapters.length - 1) + .5));
    chapters.forEach((chapter, index) => {
      chapter.inert = index !== active;
      chapter.setAttribute("aria-hidden", String(index !== active));
    });
  }
  timeline.eventCallback("onUpdate", syncActive);
  syncActive();
  return { timeline, first: contents[0], root, restore, syncActive };
}
