"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { egggymGallery } from "@/data/project-gallery";
import styles from "./projects-section.module.css";

export function ProjectGallery() {
  const shellRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);
  const syncPosition = useRef<() => void>(() => {});
  const syncPlayback = useRef<() => void>(() => {});

  useEffect(() => {
    const shell = shellRef.current!, rail = railRef.current!;
    const group = rail.firstElementChild!.firstElementChild as HTMLElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, previous = 0, position = rail.scrollLeft, distance = 0;
    let visible = false, lastWrittenScroll = rail.scrollLeft;
    function writePosition() {
      rail.scrollLeft = position;
      lastWrittenScroll = rail.scrollLeft;
    }
    // Preserve fractional progress across frames instead of accumulating scrollLeft rounding.
    function measure() {
      const oldDistance = distance;
      distance = group.getBoundingClientRect().width;
      position = oldDistance ? (position / oldDistance) * distance : rail.scrollLeft;
      if (!reduced.matches && distance) position = ((position % distance) + distance) % distance;
      writePosition();
    }
    function onScroll() {
      if (Math.abs(rail.scrollLeft - lastWrittenScroll) > 1) {
        position = rail.scrollLeft;
      }
    }
    function tick(time: number) {
      frame = 0;
      const playing = visible && !document.hidden && !reduced.matches && !pauseRef.current;
      shell.dataset.playing = String(playing);
      if (!playing) { previous = 0; return; }
      if (previous && playing && distance) {
        position = (position + Math.min(time - previous, 64) * 0.035) % distance;
        writePosition();
      }
      previous = time;
      frame = requestAnimationFrame(tick);
    }
    function updatePlayback() {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      const playing = visible && !document.hidden && !reduced.matches && !pauseRef.current;
      shell.dataset.playing = String(playing);
      if (playing) frame = requestAnimationFrame(tick);
    }
    syncPlayback.current = updatePlayback;
    // Manual navigation updates the same position without pausing or rebuilding.
    syncPosition.current = () => { position = rail.scrollLeft; lastWrittenScroll = position; };
    function changeMode() { measure(); updatePlayback(); }
    const resize = new ResizeObserver(measure);
    resize.observe(rail); resize.observe(group);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(shell);
    reduced.addEventListener("change", changeMode);
    rail.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", updatePlayback);
    measure(); updatePlayback();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      reduced.removeEventListener("change", changeMode);
      rail.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", updatePlayback);
      syncPosition.current = () => {};
      syncPlayback.current = () => {};
    };
  }, []);

  function move(direction: number) {
    const rail = railRef.current!;
    const group = rail.firstElementChild!.firstElementChild as HTMLElement;
    const distance = group.getBoundingClientRect().width;
    const step = distance / egggymGallery.length;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const requested = rail.scrollLeft + direction * step;
    const left = reduced
      ? Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, requested))
      : ((requested % distance) + distance) % distance;
    rail.scrollTo({ left, behavior: "instant" });
    syncPosition.current();
  }

  return (
    <div className={styles.gallery} ref={shellRef}>
      <div
        aria-label="Screenshot aplikasi EGGGYM, enam halaman Personal Trainer dan Member"
        aria-describedby="egggym-gallery-help"
        className={styles.rail}
        id="egggym-gallery"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
          } else if (event.key === " ") {
            event.preventDefault(); pauseRef.current = !pauseRef.current;
            syncPlayback.current();
          }
        }}
        ref={railRef}
        role="region"
        tabIndex={0}
      >
        <div className={styles.track}>
          {[false, true].map((clone) => (
            <ul aria-hidden={clone || undefined} className={`${styles.group} ${clone ? styles.clone : ""}`} key={String(clone)}>
              {egggymGallery.map((image) => (
                <li className={styles.slide} key={image.src}>
                  <figure className={styles.slideFigure}>
                    <div className={styles.slideImage}>
                      <div className={styles.screenshotViewport} style={{ aspectRatio: `${image.width - image.contentInsetLeft} / ${image.height}`, width: `min(100cqw, ${((image.width - image.contentInsetLeft) / image.height) * 100}cqh)` }}>
                        <div className={styles.screenshotCanvas}
                          style={{ width: `${image.width / (image.width - image.contentInsetLeft) * 100}%`, left: `${-image.contentInsetLeft / (image.width - image.contentInsetLeft) * 100}%` }}>
                          <Image alt={clone ? "" : `${image.role} EGGGYM — ${image.page}`} className={styles.screenshot}
                            fill quality={90} sizes="(min-width: 1024px) 280px, (min-width: 768px) 420px, 100vw" src={image.src} />
                        </div>
                      </div>
                    </div>
                  </figure>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <p className="sr-only" id="egggym-gallery-help">Slideshow tetap bergerak otomatis saat card diklik, difokuskan, atau diarahkan pointer. Gunakan panah kiri atau kanan untuk menjelajahi, dan Spasi untuk menjeda atau melanjutkan secara manual.</p>
    </div>
  );
}
