import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Keep the existing opening beats when the full shared scene cannot fit. */
export function createCompactPiscesOpening(root: HTMLElement) {
  const stack = root.querySelector<HTMLElement>("[data-pisces-stack]")!;
  const cards = [...stack.querySelectorAll<HTMLElement>("[data-pisces-card]")];
  root.dataset.piscesFallback = "";
  root.querySelectorAll<HTMLElement>("[data-pisces-opening-line]").forEach(line => {
    gsap.fromTo(line, { color: "#777777", filter: "blur(4px)" }, {
      color: "#FFFFFF", filter: "blur(0px)", ease: "none",
      scrollTrigger: { trigger: line, start: "top 95%", end: "top 65%", scrub: true, invalidateOnRefresh: true },
    });
  });
  cards.forEach((card, index) => gsap.set(card, {
    x: index * 14, y: -index * 12, rotation: -index * 2,
    scale: 1 - index * .045, zIndex: cards.length - index,
  }));
  const sequence = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  cards.slice(0, -1).forEach((card, index) => {
    sequence.to(card, { x: () => -stack.offsetWidth * 1.4, rotation: -14, autoAlpha: 0, duration: 1 }, index);
    cards.slice(index + 1).forEach((next, depth) => sequence.to(next, {
      x: depth * 14, y: -depth * 12, rotation: -depth * 2,
      scale: 1 - depth * .045, duration: 1,
    }, index));
  });
  sequence.to({}, { duration: .35 });
  ScrollTrigger.create({
    id: "pisces-compact-cards", trigger: stack, pin: stack, pinSpacing: true, start: "center center",
    end: () => `+=${Math.round(sequence.duration() * innerHeight * .45)}`,
    animation: sequence, scrub: .5, invalidateOnRefresh: true,
  });
  return { destroy() { delete root.dataset.piscesFallback; } };
}
