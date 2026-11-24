"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh";
import { birthplace, originRotation } from "@/data/origin-globe";
import { OriginOrientationController } from "./origin-globe-orientation";
import type { OriginOrientation } from "./origin-globe-orientation";
import { originCamera, sphereLines, sphereProjection, strokeSphereLines } from "./origin-globe-projection";
import type { OriginMap } from "./origin-globe-projection";
import styles from "./origin-globe.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function OriginGlobe() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const stage = stageRef.current, canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!stage || !canvas || !context) return;
    const controller = new AbortController();
    const media = gsap.matchMedia();
    let disposed = false;
    async function prepare() {
      try {
        const response = await fetch("/maps/origin-boundaries.json", { signal: controller.signal });
        if (!response.ok) throw new Error("Map unavailable");
        const map: OriginMap = await response.json();
        const world = sphereLines(map.world), region = sphereLines(map.region), target = sphereLines(map.target);
        const targetPoint = sphereLines([[[birthplace.longitude, birthplace.latitude]]])[0];
        const finalCamera = originCamera(1);
        const finalProjection = sphereProjection(finalCamera.longitude, finalCamera.latitude);
        const targetExtent = { x: 0, y: 0 };
        target.forEach(line => {
          for (let index = 0; index < line.length; index += 3) {
            const point = finalProjection(line[index], line[index + 1], line[index + 2]);
            targetExtent.x = Math.max(targetExtent.x, Math.abs(point[0]));
            targetExtent.y = Math.max(targetExtent.y, Math.abs(point[1]));
          }
        });
        await document.fonts.ready;
        if (disposed) return;
        media.add({ animate: "(prefers-reduced-motion: no-preference)", always: "all" }, mediaContext => {
          const animated = !!mediaContext.conditions?.animate;
          // The first camera beat has identical size/orientation through .12.
          // Hold that pose on entry, then start at its end to avoid a dead pin.
          const playhead = { progress: animated ? originRotation.revealStart : 1 };
          const orientation = new OriginOrientationController();
          let width = 0, height = 0, ratio = 1, zoomExponent = 1;
          let lineColor = "#a5a29c", accentColor = "#d9b482";
          const reveal = (start: number, end: number) => gsap.utils.clamp(0, 1, (playhead.progress - start) / (end - start));
          function measure() {
            width = stage!.clientWidth; height = stage!.clientHeight;
            ratio = Math.min(devicePixelRatio || 1, width < 900 ? 1.5 : 2);
            canvas!.width = Math.round(width * ratio); canvas!.height = Math.round(height * ratio);
            const theme = getComputedStyle(stage!);
            lineColor = theme.getPropertyValue("--color-text-muted").trim() || lineColor;
            accentColor = theme.getPropertyValue("--origin-accent").trim() || accentColor;
            zoomExponent = 1;
            if (width < 900) {
              // Fit the full highlighted province around the unchanged city
              // anchor. Reframe zoom continuously; never clamp it mid-flight.
              const baseRadius = Math.min(width * .41, height * .27);
              const fitRadius = Math.min((width / 2 - 24) / targetExtent.x, (height / 2 - 32) / targetExtent.y);
              const finalZoom = Math.max(1, Math.min(finalCamera.zoom, fitRadius / baseRadius));
              zoomExponent = Math.log(finalZoom) / Math.log(finalCamera.zoom);
            }
          }
          function draw(rotation: Readonly<OriginOrientation>) {
            const camera = originCamera(playhead.progress), compact = width < 900;
            // Keep the actual sphere centre fixed throughout rotation and zoom.
            const cx = width / 2;
            const cy = height / 2;
            const baseRadius = Math.min(width * (compact ? .41 : .245), height * (compact ? .27 : .36));
            const zoom = Math.pow(camera.zoom, zoomExponent);
            const radius = baseRadius * zoom;
            const project = sphereProjection(rotation.longitude, rotation.latitude);
            context!.setTransform(ratio, 0, 0, ratio, 0, 0);
            context!.clearRect(0, 0, width, height);
            context!.lineWidth = .8;
            context!.strokeStyle = lineColor;
            context!.globalAlpha = .72;
            context!.setLineDash([]);
            context!.beginPath(); context!.arc(cx, cy, radius, 0, Math.PI * 2); context!.stroke();
            context!.globalAlpha = .38;
            context!.setLineDash([5, 7]);
            for (const offset of [-7, 7]) {
              context!.beginPath(); context!.arc(cx, cy, radius + offset, 0, Math.PI * 2); context!.stroke();
            }
            context!.setLineDash([]);
            // More detailed local boundaries replace the coarse world layer as
            // we approach. Line weight stays in screen pixels through the zoom.
            context!.globalAlpha = camera.lines * .52 * (1 - reveal(.6, .78));
            if (context!.globalAlpha > 0) strokeSphereLines(context!, world, project, radius, cx, cy);
            context!.globalAlpha = camera.lines * .46 * reveal(.58, .75);
            if (context!.globalAlpha > 0) strokeSphereLines(context!, region, project, radius, cx, cy);
            context!.strokeStyle = accentColor;
            context!.globalAlpha = .85 * reveal(.74, .86);
            context!.lineWidth = 1;
            if (context!.globalAlpha > 0) strokeSphereLines(context!, target, project, radius, cx, cy);
            context!.globalAlpha = 1;
            const marker = project(targetPoint[0], targetPoint[1], targetPoint[2]);
            stage!.style.setProperty("--origin-marker-x", `${cx + marker[0] * radius}px`);
            stage!.style.setProperty("--origin-marker-y", `${cy + marker[1] * radius}px`);
            stage!.style.setProperty("--origin-marker-opacity", String(marker[2] > 0 ? camera.marker : 0));
            stage!.dataset.originPhase = camera.label;
            stage!.dataset.originProgress = playhead.progress.toFixed(4);
            stage!.dataset.originRotation = animated ? rotation.mode : "still";
            stage!.dataset.originLongitude = rotation.longitude.toFixed(6);
            stage!.dataset.originZoom = zoom.toFixed(6);
          }
          // Scroll owns orientation; idle time must not add an automatic turn.
          function paint() { draw(orientation.advance(playhead.progress, 0)); }
          measure(); paint(); stage!.dataset.originReady = "true";
          let observer: ResizeObserver | undefined, visibilityObserver: IntersectionObserver | undefined;
          let live = true, inView = false, ticking = false, dirty = false, lastFrame = 0;
          function stop() {
            gsap.ticker.remove(tick); ticking = false; lastFrame = 0;
            stage!.dataset.originRendering = "false";
          }
          function wake() {
            if (!live) return;
            dirty = true;
            if (!inView || document.hidden || ticking) return;
            ticking = true; lastFrame = performance.now();
            stage!.dataset.originRendering = "true";
            gsap.ticker.add(tick);
          }
          function tick() {
            if (!live || !inView || document.hidden) { stop(); return; }
            const now = performance.now(), elapsed = (now - lastFrame) / 1000;
            const fps = width < 900 ? originRotation.compactFps : originRotation.desktopFps;
            if (elapsed < 1 / fps) return;
            // Retain fractional frame time instead of dropping it at each draw.
            lastFrame = now - (elapsed % (1 / fps)) * 1000;
            if (!dirty) { stop(); return; }
            dirty = false; paint();
          }
          function onVisibilityChange() { if (document.hidden) stop(); else wake(); }
          if (animated) {
            // One GSAP ticker callback owns rendering. Scroll only changes the
            // playhead and wakes it; no per-scroll tween or competing rotation.
            visibilityObserver = new IntersectionObserver(entries => {
              if (!live) return;
              inView = entries[0].isIntersecting;
              if (inView) wake(); else stop();
            });
            visibilityObserver.observe(stage!);
            document.addEventListener("visibilitychange", onVisibilityChange);
            const zoomDistance = () => Math.round(Math.max(2100, Math.min(3600, innerHeight * 3.75)));
            const holdDistance = () => Math.round(innerHeight * .4);
            const sequence = gsap.timeline({ paused: true, defaults: { ease: "none" } })
              .to(playhead, { progress: 1, duration: 1, onUpdate: wake })
              // Keep the fully revealed marker and final camera pose unchanged.
              // This beat consumes scroll distance, never elapsed wall time.
              .to({}, { duration: holdDistance() / zoomDistance() });
            const hold = sequence.recent() as gsap.core.Tween;
            // Entry remains in normal document flow. The centered sequence
            // stays pinned through the short Pontianak hold before releasing.
            ScrollTrigger.create({ id: "origin-globe", trigger: stage!, pin: stage!, start: "center center",
              animation: sequence,
              end: () => {
                const travel = zoomDistance(), rest = holdDistance();
                // Preserve the original pixels per zoom progress on refresh,
                // including when the viewport height changes.
                hold.duration(rest / travel);
                return `+=${travel + rest}`;
              },
              scrub: 1.1, invalidateOnRefresh: true,
              onRefresh: () => { measure(); paint(); wake(); },
            });
          } else {
            observer = new ResizeObserver(() => { if (live) { measure(); paint(); } }); observer.observe(stage!);
          }
          ScrollTrigger.sort(); requestScrollRefresh();
          return () => {
            live = false; stop(); observer?.disconnect(); visibilityObserver?.disconnect();
            document.removeEventListener("visibilitychange", onVisibilityChange);
            stage!.removeAttribute("style");
            delete stage!.dataset.originReady; delete stage!.dataset.originPhase; delete stage!.dataset.originProgress;
            delete stage!.dataset.originRotation; delete stage!.dataset.originLongitude; delete stage!.dataset.originRendering;
            delete stage!.dataset.originZoom;
          };
        });
      } catch {
        // The semantic static SVG remains visible if local data cannot load.
      }
    }
    void prepare();
    return () => { disposed = true; controller.abort(); media.revert(); };
  }, []);

  return (
    <article aria-label="Perjalanan globe menuju Pontianak" className={styles.section} data-origin-globe id="asal-saya">
      <div className={styles.stage} data-origin-stage ref={stageRef}>
        <Image alt="Garis wilayah Kalimantan Barat dengan penanda tempat lahir di Pontianak" className={styles.staticMap} height={600} src="/maps/pontianak.svg" width={800} />
        <canvas aria-hidden="true" className={styles.canvas} ref={canvasRef} />
        <div aria-hidden="true" className={styles.marker} data-origin-marker>
          <span className={styles.markerDot} />
          <span className={styles.markerLabel}><strong>Pontianak</strong></span>
        </div>
        <p className="sr-only">Perjalanan dari dunia, melalui Asia Tenggara, Indonesia, dan Kalimantan Barat, menuju Pontianak, tempat saya lahir. Koordinat: 0,0263° LS, 109,3425° BT.</p>
      </div>
    </article>
  );
}
