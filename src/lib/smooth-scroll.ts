import type Lenis from "lenis";

let pageScroll: Lenis | null = null;
let locked = false;

export function attachPageScroll(instance: Lenis | null) {
  pageScroll = instance;
  if (locked) instance?.stop();
}

export function setPageScrollLocked(value: boolean) {
  locked = value;
  if (value) pageScroll?.stop();
  else pageScroll?.start();
}

export function cancelPageScrollMomentum() {
  if (pageScroll) pageScroll.scrollTo(window.scrollY, { immediate: true });
}

export function scrollPageTo(target: number | HTMLElement, immediate = false) {
  if (pageScroll) {
    pageScroll.scrollTo(target, { immediate });
    return;
  }
  const behavior = immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
  if (typeof target === "number") window.scrollTo({ top: target, behavior });
  else target.scrollIntoView({ block: "start", behavior });
}

export function updatePageHash(href: string) {
  if (window.location.hash === href) return;
  window.history.pushState(null, "", href);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
