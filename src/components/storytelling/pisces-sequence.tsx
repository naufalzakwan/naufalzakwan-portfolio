"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh";
import { createViewportResizeHandler } from "@/lib/viewport-resize";
import { SplitText } from "gsap/SplitText";
import { createSharedChapters } from "./shared-chapters";
import { createMemoriesOrbit, createMemoryOrbitTrigger, createStandaloneMemoriesOrbit } from "./memories-orbit";
import { createMemoryTypewriter, createStandaloneMemoryTypewriter } from "./memories-typewriter";
import { addMemoriesReading, addMemoriesGalleryEntrance, memoriesReadingDistance } from "./memories-reading";
import { createSharedMemoryPhoto } from "./memories-shared-photo";
import { memoryTypingDistance } from "./typewriter-rhythm";
import { addPiscesTextReveal } from "./pisces-text-reveal";
import { createCompactPiscesOpening } from "./pisces-compact-opening";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function PiscesSequence() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("[data-pisces-root]");
    const stage = root?.querySelector<HTMLElement>("[data-pisces-stage]");
    const journey = root?.closest<HTMLElement>("[data-story-journey]");
    const viewport = journey?.querySelector<HTMLElement>("[data-journey-viewport]");
    const track = journey?.querySelector<HTMLElement>("[data-journey-track]");
    const opening = journey?.querySelector<HTMLElement>("[data-memory-opening-stage]");
    const intro = journey?.querySelector<HTMLElement>("[data-memories-intro]");
    const chapterRoot = journey?.querySelector<HTMLElement>("[data-memories-chapters]");
    if (!root || !stage || !journey || !viewport || !track || !opening || !intro || !chapterRoot) return;
    const originalIntroInert = intro.inert;
    const rolling = root.querySelector<HTMLElement>("[data-pisces-rolling]")!;
    const rollingText = root.querySelector<HTMLElement>("[data-pisces-rolling-text]")!;
    const stack = root.querySelector<HTMLElement>("[data-pisces-stack]")!;
    const cards = [...root.querySelectorAll<HTMLElement>("[data-pisces-card]")];
    const chart = root.querySelector<HTMLElement>("[data-pisces-chart]")!;
    const copy = root.querySelector<HTMLElement>("[data-pisces-copy]")!;
    const copyItems = [...root.querySelectorAll<HTMLElement>("[data-pisces-copy-item]")];
    const sign = root.querySelector<HTMLElement>("[data-pisces-sign]")!;
    const paragraphs = [...root.querySelectorAll<HTMLElement>("[data-pisces-paragraph]")];
    const paths = [...root.querySelectorAll<SVGGeometryElement>("[data-pisces-draw]")];
    const glyphs = [...root.querySelectorAll<SVGTextElement>("[data-pisces-glyph]")];
    const stars = [...root.querySelectorAll<SVGCircleElement>("[data-pisces-star]")];
    const starRadii = stars.map((star) => star.getAttribute("r")!);
    const mark = root.querySelector<SVGGElement>("[data-pisces-mark]")!;
    const wheel = root.querySelector<SVGGElement>("svg > g:nth-of-type(2)")!;
    const elements = [journey, viewport, track, opening, intro, root, stage, rolling, stack, chart, copy, ...cards, ...copyItems, sign, ...paragraphs, ...paths, ...glyphs, ...stars, mark, wheel];
    const originals = elements.map((element) => element.getAttribute("style"));
    const media = gsap.matchMedia();
    function standaloneTextReveal() {
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: copy, start: "top 95%", end: "bottom 75%", scrub: 1, invalidateOnRefresh: true,
      } });
      return addPiscesTextReveal(timeline, copyItems[0], sign, paragraphs, 0, 1);
    }

    media.add("(prefers-reduced-motion: no-preference) and (min-height: 700px)", () => {
      let context: gsap.Context | undefined;
      let split: SplitText | undefined;
      let copySplit: SplitText | undefined;
      let compactOpening: ReturnType<typeof createCompactPiscesOpening> | undefined;
      let typewriter: ReturnType<typeof createMemoryTypewriter> | undefined;
      let sharedChapters: ReturnType<typeof createSharedChapters>;
      let orbit: ReturnType<typeof createMemoriesOrbit> | undefined;
      let sharedPhoto: ReturnType<typeof createSharedMemoryPhoto> | undefined;
      let reading: ReturnType<typeof addMemoriesReading> | undefined;
      let galleryEntrance: ReturnType<typeof addMemoriesGalleryEntrance> | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let frame = 0, disposed = false;
      let lastWidth = innerWidth, lastHeight = innerHeight;

      function reset() {
        context?.revert(); context = undefined;
        compactOpening?.destroy(); compactOpening = undefined;
        copySplit?.revert(); copySplit = undefined;
        reading?.destroy(); reading = undefined;
        galleryEntrance?.destroy(); galleryEntrance = undefined;
        sharedPhoto?.destroy(); sharedPhoto = undefined;
        orbit?.destroy(); orbit = undefined;
        sharedChapters?.restore(); sharedChapters = undefined;
        split?.revert(); split = undefined;
        typewriter?.destroy(); typewriter = undefined;
        delete root!.dataset.piscesMotion;
        delete journey!.dataset.journeyMotion;
        intro!.inert = originalIntroInert;
        elements.forEach((element, index) => {
          const style = originals[index];
          if (style === null) element.removeAttribute("style"); else element.setAttribute("style", style);
        });
        stars.forEach((star, index) => star.setAttribute("r", starRadii[index]));
      }

      function build() {
        if (disposed || !stage!.isConnected) return;
        reset();
        const height = innerHeight;
        const contentWidth = journey!.clientWidth;
        const viewportWidth = document.documentElement.clientWidth;
        journey!.style.setProperty("--journey-width", `${viewportWidth}px`);
        journey!.style.setProperty("--journey-height", `${height}px`);
        journey!.style.setProperty("--journey-gutter", `${Math.max(0, (viewportWidth - contentWidth) / 2)}px`);
        journey!.dataset.journeyMotion = "active";
        root!.style.setProperty("--pisces-height", `${height}px`);
        root!.dataset.piscesMotion = "active";
        const width = stage!.clientWidth;
        const desktop = matchMedia("(min-width: 896px)").matches;
        const diagramSize = Math.min(width * (desktop ? .45 : .94), height * .72, 560);
        const finalSize = desktop ? diagramSize : Math.min(width * .72, 240);
        root!.style.setProperty("--pisces-diagram-size", `${diagramSize}px`);
        const copyHeight = copy.offsetHeight;
        const totalHeight = copyHeight + finalSize + 24;
        // Keep all narrative readable: compact/landscape screens use the static layout.
        if (copyHeight > height - 40 || (!desktop && totalHeight > height - 32)) {
          reset();
          context = gsap.context(() => {
            compactOpening = createCompactPiscesOpening(root!);
            copySplit = standaloneTextReveal();
            typewriter = createStandaloneMemoryTypewriter(opening!);
            orbit = createStandaloneMemoriesOrbit(intro!);
          });
          requestScrollRefresh(); return;
        }
        const copyTop = (height - (desktop ? copyHeight : totalHeight)) / 2;
        const finalY = desktop ? -10 : copyTop + copyHeight + 24 + finalSize / 2 - height / 2;
        const machine = opening!.querySelector<HTMLElement>("[data-typewriter-machine]")!;
        // Measure the final CSS layout before animating either object. Both
        // remain in their existing wrappers but share this viewport anchor.
        const machineBounds = machine.getBoundingClientRect();
        const stageBounds = stage!.getBoundingClientRect();
        const anchorX = (machineBounds.left + machineBounds.right) / 2 - stageBounds.left - width / 2;
        const anchorY = (machineBounds.top + machineBounds.bottom) / 2 - stageBounds.top - height / 2;
        // Leave enough shared travel for the whole copy column to clear the
        // viewport before the circle reaches the typewriter's final anchor.
        const narrativeX = desktop ? Math.max(width / 4,
          anchorX + stageBounds.left + copy.offsetLeft + copy.offsetWidth + 24) : 0;
        const slideX = desktop ? anchorX - narrativeX : 0;

        try {
          context = gsap.context(() => {
            sharedChapters = createSharedChapters(chapterRoot!, height);
            if (!sharedChapters) return;
            split = new SplitText(rollingText, { type: "words,chars", charsClass: "pisces-char", aria: "none" });
            const chars = split.chars;
            // Read all SVG geometry before writing dash styles. Interleaving
            // getTotalLength with writes forced a new SVG layout per path.
            const pathLengths = paths.map(path => path.getTotalLength());
            const openingLines = [...rolling.querySelectorAll<HTMLElement>("[data-pisces-opening-line]")];
            const firstScene = rolling.querySelector<HTMLElement>("[data-pisces-opening-scene]")!;
            const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
            // Each sentence occupies its own centered scene. The first scene's
            // exit uses its wrapper so it cannot conflict with the entrance.
            gsap.set(chars, { autoAlpha: 1, rotationX: 0, yPercent: 0, transformOrigin: "50% 50% -50px", force3D: true });
            gsap.set(openingLines, { autoAlpha: 0, color: "#777777", filter: "blur(4px)" });
            gsap.set(stack, { autoAlpha: 0, scale: .9 });
            cards.forEach((card, index) => gsap.set(card, { x: index * 14, y: -index * 12, rotation: -index * 2, scale: 1 - index * .045, zIndex: 4 - index }));
            gsap.set(chart, { autoAlpha: 0, xPercent: -50, yPercent: -50, scale: .025, filter: "blur(0px)" });
            // The diagram initially forms in the center, across the future
            // text column. Keep all copy absent until that move is complete.
            gsap.set(copy, { top: copyTop, autoAlpha: 0 });
            // Keep the copy in its final layout; reveal only ink and opacity.
            paths.forEach((path, index) => {
              path.style.strokeDasharray = String(pathLengths[index]);
              path.style.strokeDashoffset = String(pathLengths[index]);
            });
            gsap.set(glyphs, { autoAlpha: 0, y: 6 });
            // Radius growth is visually identical to scaling a circle but does
            // not accumulate SVG origin offsets when the shared pin refreshes.
            stars.forEach(star => { star.style.opacity = "0"; star.setAttribute("r", "0"); });
            gsap.set(mark, { autoAlpha: 0 });

            timeline.addLabel("rolling", 0)
              .to(firstScene, { autoAlpha: 0, duration: .025 }, .01)
              .addLabel("zodiac-question", .045)
              .to(openingLines[1], { autoAlpha: 1, color: "#FFFFFF", filter: "blur(0px)", duration: .045 }, .045)
              .to(chars, { autoAlpha: 0, rotationX: -92, yPercent: -115, duration: .045, stagger: { amount: .025 }, ease: "power2.in" }, .11)
              .addLabel("cards", .18)
              .to(stack, { autoAlpha: 1, scale: 1, duration: .025, ease: "power2.out" }, .18);
            [0, 1, 2].forEach((index) => {
              const start = .23 + index * .05;
              timeline.to(cards[index], { y: -height * .48, x: -width * .08, rotation: -12, autoAlpha: 0, duration: .025, ease: "power1.inOut" }, start);
              cards.slice(index + 1).forEach((card, depth) => timeline.to(card, {
                x: depth * 14, y: -depth * 12, rotation: -depth * 2, scale: 1 - depth * .045,
                duration: .025, ease: "power1.inOut",
              }, start));
            });
            timeline.addLabel("pisces-card", .365)
              .to(stack, { autoAlpha: 0, scale: .15, duration: .04, ease: "power2.inOut" }, .395)
              .addLabel("circle", .405)
              .to(chart, { autoAlpha: 1, scale: 1, duration: .065, ease: "power2.out" }, .405);

            function draw(kind: string, start: number, duration: number, stagger = 0) {
              const targets = paths.filter((path) => path.dataset.piscesDraw === kind);
              timeline.to(targets, { strokeDashoffset: 0, duration, stagger: { amount: stagger } }, start);
            }
            draw("outer", .405, .065);
            draw("axes", .48, .03);
            draw("hub", .50, .03);
            timeline.addLabel("formation", .53);
            draw("ring", .53, .035, .01);
            draw("sector", .565, .025, .03);
            draw("tick", .585, .02, .025);
            timeline.to(glyphs, { autoAlpha: 1, y: 0, duration: .02, stagger: { amount: .035 } }, .625)
              .to(stars, { opacity: 1, attr: { r: (index: number) => starRadii[index] }, duration: .018, stagger: { amount: .035 } }, .675);
            draw("constellation", .71, .025, .035);
            timeline.to(mark, { autoAlpha: 1, duration: .025 }, .76)
              .to(wheel, { rotation: 1, svgOrigin: "320 320", duration: .025 }, .775)
              .to(wheel, { rotation: 0, duration: .02 }, .80)
              .addLabel("shift", .80)
              .set(stage!, { overflow: "visible" }, .80)
              .to(chart, { x: narrativeX, y: desktop ? anchorY : finalY, scale: finalSize / diagramSize, duration: .08, ease: "power1.inOut" }, .80)
              .addLabel("narrative", .88)
              .set(copy, { autoAlpha: 1 }, "narrative");

            // Move the zodiac as one group, hold the isolated circle briefly,
            // then fade out fully before revealing the machine at that anchor.
            const formationDistance = height * (desktop ? 6.8 : 6);
            const wordCount = paragraphs.reduce((count, paragraph) => count + paragraph.textContent!.trim().split(/\s+/).length, 0);
            const readingDurationPixels = Math.max(height * 1.8, wordCount * 20);
            const copyDuration = readingDurationPixels / formationDistance;
            const copyStart = timeline.labels.narrative;
            const copyComplete = copyStart + copyDuration;
            const narrativeExitStart = Math.max(1, copyComplete + height * .22 / formationDistance);
            copySplit = addPiscesTextReveal(timeline, copyItems[0], sign, paragraphs, copyStart, copyDuration);
            timeline.addLabel("complete", copyComplete);
            const slideDuration = height * .55 / formationDistance;
            const focusStart = narrativeExitStart + slideDuration;
            const morphStart = focusStart + height * .1 / formationDistance;
            const zodiacFadeDuration = height * .38 / formationDistance;
            const zodiacHidden = morphStart + zodiacFadeDuration;
            // A reversible scroll interval, not a timer or scroll lock. At a
            // moderate 600px/s this black interval lasts approximately 420ms.
            const blackGapDistance = 600 * .42;
            const machineEntry = zodiacHidden + blackGapDistance / formationDistance;
            const machineFadeDuration = height * .38 / formationDistance;
            const handoffEnd = machineEntry + machineFadeDuration;
            const typingStart = handoffEnd + height * .21 / formationDistance;
            const typingDuration = memoryTypingDistance(height) / formationDistance;
            const typingEnd = typingStart + typingDuration;
            const openingExit = typingEnd + height * .14 / formationDistance;
            const openingExitDuration = height / formationDistance;
            const revealAt = openingExit + openingExitDuration;
            typewriter = createMemoryTypewriter(opening!);
            orbit = createMemoriesOrbit(intro!);
            // Photo 01 is the first story. Continue the final preview by one
            // arc step to focus that exact item before starting its morph.
            orbit.state.phase = orbit.count;
            orbit.render();
            const firstMemoryId = sharedChapters.first.closest<HTMLElement>("[data-memory-chapter]")!.dataset.memoryId;
            const sourcePhoto = [...intro!.querySelectorAll<HTMLElement>("[data-memory-card]")]
              .find(card => card.dataset.memoryId === firstMemoryId)!;
            const targetPhoto = sharedChapters.first.querySelector<HTMLElement>("[data-memory-detail-frame]")!;
            sharedPhoto = createSharedMemoryPhoto(viewport!, sourcePhoto, targetPhoto, orbit.render);
            orbit.state.phase = 0;
            orbit.render();
            gsap.set(sharedChapters.first, { background: "transparent" });
            gsap.set(sharedChapters.first.querySelectorAll("[data-memory-copy] > *"), { x: 40, autoAlpha: 0 });
            const readingStart = revealAt - height * .12 / formationDistance;
            const readingDuration = memoriesReadingDistance(intro!, height) / formationDistance;
            const readingEnd = readingStart + readingDuration;
            const galleryEntry = readingEnd + Math.max(280, height * .35) / formationDistance;
            const galleryEntryDuration = height * .65 / formationDistance;
            const orbitStart = galleryEntry + galleryEntryDuration + Math.max(160, height * .16) / formationDistance;
            const orbitStep = Math.max(280, Math.min(560, height * .6)) / formationDistance;
            const orbitEnd = orbitStart + (orbit.count - 1) * orbitStep;
            // Continue directly from photo 05 to the returning photo 01.
            // Both linear tweens cover one arc step over the same distance.
            const focusFirstStart = orbitEnd;
            const focusFirstEnd = focusFirstStart + orbitStep;
            const transitionStart = focusFirstEnd + height * .1 / formationDistance;
            const transitionDuration = height * .9 / formationDistance;
            const storyEntry = transitionStart + transitionDuration * .44;
            const stackingStart = transitionStart + transitionDuration + height * .2 / formationDistance;
            const endDistance = stackingStart * formationDistance + height * 4;
            gsap.set(opening!, { autoAlpha: 1, background: "transparent" });
            // Adjacent viewport panels: both move by exactly the same distance
            // during the handoff. Visibility never toggles at this boundary.
            gsap.set(intro!, { autoAlpha: 1, y: height });
            gsap.set(machine, { autoAlpha: 0, y: 12, scale: .98, filter: "blur(2px)", transformOrigin: "50% 50%" });
            timeline.addLabel("zodiac-slide", narrativeExitStart)
              .to(track!, { x: slideX, duration: slideDuration, ease: "power1.inOut" }, narrativeExitStart);
            // On stacked screens, finish reading and fade the stationary copy
            // before the circle travels upward through its former text area.
            if (!desktop) {
              const copyExitDuration = height * .12 / formationDistance;
              timeline.to(copy, { autoAlpha: 0, duration: copyExitDuration }, narrativeExitStart - copyExitDuration)
                .to(chart, { x: anchorX, y: anchorY, duration: slideDuration, ease: "power1.inOut" }, narrativeExitStart);
            }
            timeline.addLabel("typewriter-focus", focusStart)
              .set(copy, { autoAlpha: 0 }, focusStart)
              .addLabel("typewriter-morph", morphStart)
              .addLabel("zodiac-fade-out", morphStart);
            // Fade the whole SVG continuously, then keep both visuals hidden
            // before the machine enters. Reversing scroll reverses each stage.
            timeline.to(chart, { autoAlpha: 0, scale: finalSize / diagramSize * .985, filter: "blur(2px)",
              duration: zodiacFadeDuration, ease: "power1.inOut" }, morphStart)
              .addLabel("zodiac-fully-hidden", zodiacHidden)
              .addLabel("short-transition-gap", zodiacHidden)
              .addLabel("typewriter-fade-in", machineEntry)
              .to(machine, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)",
                duration: machineFadeDuration, ease: "power1.inOut" }, machineEntry)
              .addLabel("typewriter-morph-complete", handoffEnd)
              .fromTo(typewriter.heading, { x: 60, autoAlpha: 0 }, {
                x: 0, autoAlpha: 1, duration: height * .18 / formationDistance,
                ease: "power1.out", immediateRender: true,
              }, handoffEnd)
              .addLabel("memory-typing-start", typingStart)
              .to(typewriter.state, { progress: 1, duration: typingDuration, ease: "none" }, typingStart)
              .addLabel("memory-typing-end", typingEnd)
              .addLabel("typewriter-to-memories", openingExit)
              .to(opening!, { y: -height, duration: openingExitDuration, ease: "none" }, openingExit)
              .to(intro!, { y: 0, duration: openingExitDuration, ease: "none" }, openingExit)
              .addLabel("memories-entry-complete", revealAt);
            // Begin while the paragraph reaches the middle of the viewport.
            // Keep photos below the viewport through typing and the read hold.
            reading = addMemoriesReading(timeline, intro!, readingStart, readingDuration);
            galleryEntrance = addMemoriesGalleryEntrance(timeline, intro!, height, galleryEntry, galleryEntryDuration);
            timeline.addLabel("memory-reading-start", readingStart)
              .addLabel("memory-reading-end", readingEnd)
              .addLabel("memory-gallery-entry", galleryEntry)
              .addLabel("memory-gallery-visible", galleryEntry + galleryEntryDuration);
            timeline.addLabel("memory-orbit-start", orbitStart)
              .to(orbit.state, { phase: orbit.count - 1, duration: orbitEnd - orbitStart,
                ease: "none" }, orbitStart)
              .addLabel("memory-orbit-end", orbitEnd)
              .addLabel("focus-first-memory", focusFirstStart)
              .to(orbit.state, { phase: orbit.count, duration: orbitStep, ease: "none" }, focusFirstStart)
              .addLabel("first-memory-focused", focusFirstEnd)
              .addLabel("carousel-to-story", transitionStart)
              .to(intro!.querySelector("p"), {
                y: -height * .35, autoAlpha: 0,
                duration: transitionDuration * .7, ease: "none",
              }, transitionStart)
              .to(intro!.querySelector("p + div"), { y: -height, duration: transitionDuration,
                ease: "none" }, transitionStart)
              .to(sharedPhoto.state, { progress: 1, duration: transitionDuration, ease: "power1.inOut" }, transitionStart)
              .addLabel("first-story-entry", storyEntry)
              .to(sharedChapters.first.querySelectorAll("[data-memory-copy] > *"), {
                x: 0, autoAlpha: 1, duration: transitionDuration * .28, stagger: transitionDuration * .12,
                ease: "power1.out",
              }, storyEntry)
              .addLabel("gallery-photo-in-story", transitionStart + transitionDuration)
              .addLabel("chapter-stacking", stackingStart)
              .add(sharedChapters.timeline.timeScale(formationDistance / height).play(), stackingStart);
            let typingScrub = false;
            let renderedTyping = -1, renderedOrbit = -1;
            intro!.inert = true;
            function syncStages() {
              // A fast scroll can skip a whole child tween. Render from the
              // master state so text, keycaps and photos still reach that frame.
              if (renderedTyping !== typewriter!.state.progress) {
                renderedTyping = typewriter!.state.progress; typewriter!.render();
              }
              if (renderedOrbit !== orbit!.state.phase) {
                renderedOrbit = orbit!.state.phase; orbit!.render();
              }
              sharedPhoto!.render();
              reading!.render();
              galleryEntrance!.render();
              // Accessibility follows rendered positions; it does not change
              // either panel's opacity or start an independent animation.
              intro!.inert = timeline.time() < revealAt || timeline.time() >= transitionStart;
              chapterRoot!.inert = timeline.time() <= storyEntry;
            }
            timeline.eventCallback("onUpdate", syncStages);
            const trigger = createMemoryOrbitTrigger({
              id: "pisces-story-sequence", trigger: viewport!, pin: true,
              start: "top top", end: () => `+=${Math.round(endDistance)}`,
              animation: timeline, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
              snap: orbit.snap(orbitStart, orbitEnd, () => timeline.duration()),
              onRefresh: (self) => {
                const pixelsPerTime = (self.end - self.start) / timeline.duration();
                orbit?.setScrollRange(self.start + orbitStart * pixelsPerTime, self.start + orbitEnd * pixelsPerTime);
                typewriter?.setScrollRange(self.start + typingStart * pixelsPerTime, self.start + typingEnd * pixelsPerTime);
                reading?.setScrollRange(self.start + readingStart * pixelsPerTime, self.start + readingEnd * pixelsPerTime);
                galleryEntrance?.setScrollRange(self.start + galleryEntry * pixelsPerTime, self.start + (galleryEntry + galleryEntryDuration) * pixelsPerTime);
              },
              onUpdate: (self) => {
                const scrollTime = self.progress * timeline.duration();
                const next = scrollTime >= narrativeExitStart && scrollTime <= revealAt;
                if (next !== typingScrub) { typingScrub = next; self.getTween()?.duration(next ? .2 : 1); }
                syncStages();
              },
            });
            trigger.refresh(); trigger.update();
            const entrance = gsap.timeline({
              defaults: { ease: "none", duration: 1 },
              scrollTrigger: {
                id: "pisces-opening-reveal", trigger: openingLines[0],
                start: "top 95%", endTrigger: stage!,
                end: () => `top ${innerHeight - Math.min(stage!.clientHeight, innerHeight) * .78}px`,
                scrub: true, invalidateOnRefresh: true,
              },
            });
            entrance.to(openingLines[0], { autoAlpha: 1, color: "#FFFFFF", filter: "blur(0px)" });
            timeline.totalProgress(trigger.progress, true);
            sharedChapters.syncActive();
            syncStages();
          }, root!);
          if (!sharedChapters) {
            reset();
            context = gsap.context(() => {
              compactOpening = createCompactPiscesOpening(root!);
              copySplit = standaloneTextReveal();
              typewriter = createStandaloneMemoryTypewriter(opening!);
              orbit = createStandaloneMemoriesOrbit(intro!);
            });
            requestScrollRefresh(); return;
          }
          requestScrollRefresh();
        } catch (error) {
          reset(); throw error;
        }
      }

      function scheduleBuild() {
        clearTimeout(timer); cancelAnimationFrame(frame);
        timer = setTimeout(() => { frame = requestAnimationFrame(build); }, 120);
      }
      function onResize() {
        // Ignore tiny mobile address-bar height changes; real resizes rebuild safely.
        if (innerWidth === lastWidth && Math.abs(innerHeight - lastHeight) < 80) return;
        lastWidth = innerWidth; lastHeight = innerHeight; scheduleBuild();
      }
      document.fonts.ready.then(() => { if (!disposed) scheduleBuild(); });
      document.fonts.addEventListener("loadingdone", scheduleBuild);
      window.addEventListener("resize", onResize);
      return () => {
        disposed = true; clearTimeout(timer); cancelAnimationFrame(frame);
        document.fonts.removeEventListener("loadingdone", scheduleBuild);
        window.removeEventListener("resize", onResize);
        reset(); requestScrollRefresh();
      };
    });
    // Short viewports retain a dedicated finite orbit without the Pisces pin.
    media.add("(prefers-reduced-motion: no-preference) and (max-height: 699px)", () => {
      let context: gsap.Context | undefined;
      let orbit: ReturnType<typeof createMemoriesOrbit> | undefined;
      let typewriter: ReturnType<typeof createMemoryTypewriter> | undefined;
      let copySplit: SplitText | undefined;
      let compactOpening: ReturnType<typeof createCompactPiscesOpening> | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let disposed = false;
      function build() {
        if (disposed) return;
        context?.revert(); copySplit?.revert(); orbit?.destroy(); typewriter?.destroy();
        compactOpening?.destroy();
        context = gsap.context(() => {
          compactOpening = createCompactPiscesOpening(root!);
          copySplit = standaloneTextReveal();
          typewriter = createStandaloneMemoryTypewriter(opening!);
          orbit = createStandaloneMemoriesOrbit(intro!);
        });
        requestScrollRefresh();
      }
      function schedule() { clearTimeout(timer); timer = setTimeout(build, 120); }
      const onResize = createViewportResizeHandler(schedule);
      build();
      document.fonts.ready.then(() => { if (!disposed) schedule(); });
      window.addEventListener("resize", onResize);
      document.fonts.addEventListener("loadingdone", schedule);
      return () => {
        disposed = true; clearTimeout(timer); context?.revert(); copySplit?.revert(); orbit?.destroy(); typewriter?.destroy();
        compactOpening?.destroy();
        window.removeEventListener("resize", onResize);
        document.fonts.removeEventListener("loadingdone", schedule);
      };
    });
    // Fixed image frames do not move other pins. Keep this scene's original
    // post-load initialization, without remeasuring every section on the page.
    const images = [...intro.querySelectorAll<HTMLImageElement>("[data-memory-card] img")];
    let imageTimer: ReturnType<typeof setTimeout> | undefined;
    function refreshImages() {
      clearTimeout(imageTimer);
      imageTimer = setTimeout(() => {
        const trigger = ScrollTrigger.getById("pisces-story-sequence") ?? ScrollTrigger.getById("memories-orbit");
        trigger?.refresh();
        trigger?.update();
      }, 120);
    }
    images.forEach(image => { if (!image.complete) image.addEventListener("load", refreshImages, { once: true }); });
    return () => {
      clearTimeout(imageTimer);
      images.forEach(image => image.removeEventListener("load", refreshImages));
      media.revert();
    };
  });

  return null;
}
