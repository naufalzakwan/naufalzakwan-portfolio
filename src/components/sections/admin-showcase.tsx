"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./projects-section.module.css";

type AdminShowcaseProps = Readonly<{
  images: readonly Readonly<{ src: string; alt: string }>[];
}>;

const IDLE_GAP_MS = 2750;
const SHAKE_DURATION_MS = 1100;
const STACK_CLOSE_MS = 750;

export function AdminShowcase({ images }: AdminShowcaseProps) {
  const [expanded, setExpanded] = useState(false);
  const pointerType = useRef("");
  const primaryRef = useRef<HTMLButtonElement>(null);
  const hints = useRef<Animation[]>([]);
  const hasOpened = useRef(false);

  useEffect(() => {
    if (expanded) {
      hasOpened.current = true;
      return;
    }
    const primary = primaryRef.current;
    if (!primary) return;
    const upper = primary.parentElement?.querySelector<HTMLElement>("#admin-preview-upper");
    const lower = primary.parentElement?.querySelector<HTMLElement>("#admin-preview-lower");
    if (!upper || !lower) return;
    const cards = [
      { element: primary, amplitude: 5, delay: 0 },
      { element: upper, amplitude: 3.5, delay: 45 },
      { element: lower, amplitude: -3.75, delay: 85 },
    ];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    let disposed = false;

    function stop() {
      clearTimeout(timer);
      hints.current.forEach((animation) => animation.cancel());
      hints.current = [];
    }

    function schedule(delay = IDLE_GAP_MS) {
      clearTimeout(timer);
      if (disposed || !visible || document.hidden || reducedMotion.matches) return;
      timer = setTimeout(() => {
        if (disposed || !visible || document.hidden || reducedMotion.matches) return;
        // Individual translate composes with the supporting cards' existing
        // stack/reveal transforms, preserving their exact offsets and scale.
        const animations = cards.map(({ element, amplitude, delay }) => element.animate([
          { translate: "0px 0px" },
          { translate: `0px ${-amplitude}px`, offset: .13 },
          { translate: `0px ${amplitude}px`, offset: .29 },
          { translate: `0px ${-amplitude * .8}px`, offset: .45 },
          { translate: `0px ${amplitude * .65}px`, offset: .61 },
          { translate: `0px ${-amplitude * .4}px`, offset: .77 },
          { translate: `0px ${amplitude * .2}px`, offset: .9 },
          { translate: "0px 0px" },
        ], { duration: SHAKE_DURATION_MS, delay, easing: "ease-in-out", iterations: 1 }));
        hints.current = animations;
        void Promise.all(animations.map((animation) => animation.finished)).then(() => {
          hints.current = [];
          schedule();
        }).catch(() => { /* Hover/visibility changes cancel the whole group. */ });
      }, delay);
    }

    function resume() {
      stop();
      // Let the supporting cards finish closing, then start a fresh idle gap.
      schedule(IDLE_GAP_MS + (hasOpened.current ? STACK_CLOSE_MS : 0));
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    observer.observe(primary);
    document.addEventListener("visibilitychange", resume);
    reducedMotion.addEventListener("change", resume);
    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
      reducedMotion.removeEventListener("change", resume);
    };
  }, [expanded]);

  function reveal() {
    setExpanded(true);
    hints.current.forEach((animation) => animation.cancel());
  }

  return (
    <figure
      aria-label="Showcase Web Admin EGGGYM"
      className={styles.admin}
      data-expanded={expanded}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(":hover")) setExpanded(false);
      }}
      onPointerDown={(event) => { pointerType.current = event.pointerType; }}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") reveal(); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setExpanded(false); }}
    >
      <div className={styles.adminShowcase}>
        <div className={styles.adminImages}>
          {images.map((image, index) => {
            const picture = (
              <Image alt={image.alt} className={styles.adminScreenshot} fill quality={95}
                sizes="(min-width: 1440px) 610px, (min-width: 1024px) 44vw, (min-width: 768px) calc(100vw - 4rem), calc(100vw - 2.5rem)"
                src={image.src} />
            );

            return index === 1 ? (
              <button
                aria-controls="admin-preview-upper admin-preview-lower"
                aria-describedby="admin-showcase-help"
                aria-expanded={expanded}
                aria-label="Dashboard Admin EGGGYM"
                className={`${styles.adminImage} ${styles.adminPrimary}`}
                key={image.src}
                ref={primaryRef}
                onClick={(event) => {
                  // Mouse expansion follows the whole showcase; touch/keyboard toggle explicitly.
                  if (event.detail === 0 || pointerType.current !== "mouse") setExpanded((value) => !value);
                }}
                type="button"
              >{picture}</button>
            ) : (
              <div aria-hidden={!expanded}
                className={`${styles.adminImage} ${index === 0 ? styles.adminUpper : styles.adminLower}`}
                id={index === 0 ? "admin-preview-upper" : "admin-preview-lower"}
                key={image.src}
              >{picture}</div>
            );
          })}
        </div>
      </div>
      <span className="sr-only" id="admin-showcase-help">Arahkan pointer ke showcase, atau tekan dashboard untuk membuka dan menutup preview screenshot Admin.</span>
    </figure>
  );
}
