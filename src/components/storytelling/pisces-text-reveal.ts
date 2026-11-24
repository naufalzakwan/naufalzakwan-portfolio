import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

// Visual properties only: the words keep their original line wrapping.
export function addPiscesTextReveal(
  timeline: gsap.core.Timeline,
  heading: HTMLElement,
  sign: HTMLElement,
  paragraphs: HTMLElement[],
  start: number,
  duration: number,
) {
  const headingColor = getComputedStyle(heading).color;
  const signColor = getComputedStyle(sign).color;
  const paragraphColor = getComputedStyle(paragraphs[0]).color;
  const split = new SplitText(paragraphs, { type: "words", aria: "auto" });
  gsap.set([heading, sign], { opacity: 0, color: "#777777", filter: "blur(4px)" });
  gsap.set(split.words, { opacity: .3, color: "#555555", filter: "blur(3px)" });
  timeline.to(heading, { opacity: 1, color: headingColor, filter: "blur(0px)", duration: duration * .2, ease: "none" }, start)
    .to(sign, { opacity: 1, color: signColor, filter: "blur(0px)", duration: duration * .2, ease: "none" }, start + duration * .16)
    .to(split.words, { opacity: 1, color: paragraphColor, filter: "blur(0px)", duration: duration * .14,
      stagger: { amount: duration * .54 }, ease: "none" }, start + duration * .32);
  return split;
}
