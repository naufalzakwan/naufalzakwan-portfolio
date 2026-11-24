"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";

import { Container } from "@/components/ui";
import { profile, uiCopy } from "@/data/site-content";
import type { NavigationItem, SectionId } from "@/types";
import { scrollPageTo, setPageScrollLocked, updatePageHash } from "@/lib/smooth-scroll";

import styles from "./navigation.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type FullscreenMenuProps = Readonly<{
  activeSection: SectionId;
  items: readonly NavigationItem[];
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
}>;

// Animation ownership stays local; MotionController never targets this dialog.
export function FullscreenMenu({ activeSection, items, onClose, onNavigate, open, triggerRef }: FullscreenMenuProps) {
  const panelRef = useRef<HTMLDialogElement>(null);
  const driveRef = useRef<((nextOpen: boolean) => void) | null>(null);
  const pendingAnchorRef = useRef<string | null>(null);

  useGSAP((_, contextSafe) => {
    const panel = panelRef.current;
    if (!panel || !contextSafe) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const links = panel.querySelectorAll<HTMLElement>("[data-menu-item]");
    let timeline: gsap.core.Timeline | undefined;
    let desiredOpen = false;
    let releaseModal: (() => void) | null = null;
    let closeFallback: ReturnType<typeof setTimeout> | undefined;
    let navigationTimer: ReturnType<typeof setTimeout> | undefined;

    function clearCloseFallback() {
      clearTimeout(closeFallback);
      closeFallback = undefined;
    }

    function finishClose() {
      if (desiredOpen) return;
      clearCloseFallback();
      if (panel!.open) panel!.close();
      releaseModal?.();
      releaseModal = null;
      timeline?.pause(0);

      // Defer navigation until the dialog and both scroll locks are released.
      const href = pendingAnchorRef.current;
      pendingAnchorRef.current = null;
      if (href) {
        // The zodiac's native anchor begins at an intentionally empty frame
        // of a long pinned sequence. Land at its existing readable state;
        // leave the sequence, its distances and its reversible animation intact.
        if (href === "#zodiak-saya") {
          // Restore scrollbar width and let the responsive sequence rebuild
          // before measuring its range; an open dialog changes that geometry.
          clearTimeout(navigationTimer);
          navigationTimer = setTimeout(() => {
            const zodiac = ScrollTrigger.getById("pisces-story-sequence");
            updatePageHash(href);
            if (zodiac?.animation instanceof gsap.core.Timeline && zodiac.animation.labels.complete !== undefined) {
              scrollPageTo(zodiac.labelToScroll("complete"), motionPreference.matches);
            } else {
              const target = document.getElementById(href.slice(1));
              if (target) scrollPageTo(target);
            }
          }, 200);
          return;
        }
        updatePageHash(href);
        const target = document.getElementById(href.slice(1));
        if (target) scrollPageTo(target);
      }
    }

    // Measure links only after the dialog is in the rendering tree. Preparing
    // transforms in a closed dialog makes GSAP temporarily reveal hidden nodes.
    const prepareTimeline = contextSafe(() => {
      if (timeline) return;
      try {
        timeline = gsap.timeline({ paused: true, onReverseComplete: finishClose })
          .fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power1.out" }, 0)
          .fromTo(links, { opacity: 0, y: 12 }, {
            opacity: 1,
            y: 0,
            duration: 0.22,
            stagger: 0.025,
            ease: "power2.out",
          }, 0.06);
      } catch {
        timeline?.kill();
        timeline = undefined;
        // Functional fallback if animation initialization fails.
        gsap.set([panel, ...links], { clearProps: "opacity,transform" });
      }
    });

    function drive(nextOpen: boolean) {
      desiredOpen = nextOpen;
      clearCloseFallback();

      if (nextOpen) {
        clearTimeout(navigationTimer);
        pendingAnchorRef.current = null;
        if (!panel!.open) {
          const body = document.body;
          const root = document.documentElement;
          const previousBodyOverflow = body.style.overflow;
          const previousRootOverflow = root.style.overflow;
          const previousPadding = body.style.paddingRight;
          const scrollbarWidth = window.innerWidth - root.clientWidth;

          try {
            panel!.showModal();
          } catch {
            desiredOpen = false;
            onClose();
            return;
          }
          prepareTimeline();
          panel!.scrollTop = 0;
          if (scrollbarWidth > 0) {
            body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbarWidth}px`;
          }
          body.style.overflow = "hidden";
          root.style.overflow = "hidden";
          setPageScrollLocked(true);
          releaseModal = () => {
            body.style.overflow = previousBodyOverflow;
            root.style.overflow = previousRootOverflow;
            body.style.paddingRight = previousPadding;
            setPageScrollLocked(false);
            triggerRef.current?.focus({ preventScroll: true });
          };
          panel!.querySelector<HTMLAnchorElement>("nav a")?.focus({ preventScroll: true });
        }
        if (motionPreference.matches) timeline?.progress(1).pause();
        else timeline?.timeScale(1).play();
      } else if (panel!.open) {
        if (motionPreference.matches || !timeline || timeline.time() === 0) {
          finishClose();
        } else {
          timeline.timeScale(1.6).reverse();
          // Also unlock if the animation ticker stops or the tab is suspended.
          closeFallback = setTimeout(finishClose, 500);
        }
      }
    }

    function updateMotionPreference() {
      if (!motionPreference.matches) return;
      if (desiredOpen) timeline?.progress(1).pause();
      else finishClose();
    }

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const controls = Array.from(panel!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      const outside = !panel!.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleNativeClose() {
      // Ignore a queued close event from a dialog that has already reopened.
      if (panel!.open) return;
      desiredOpen = false;
      finishClose();
      onClose();
    }

    driveRef.current = drive;
    motionPreference.addEventListener("change", updateMotionPreference);
    panel.addEventListener("keydown", trapFocus);
    panel.addEventListener("close", handleNativeClose);

    return () => {
      driveRef.current = null;
      clearTimeout(navigationTimer);
      pendingAnchorRef.current = null;
      clearCloseFallback();
      panel.removeEventListener("keydown", trapFocus);
      panel.removeEventListener("close", handleNativeClose);
      motionPreference.removeEventListener("change", updateMotionPreference);
      timeline?.kill();
      if (panel.open) panel.close();
      releaseModal?.();
      releaseModal = null;
    };
  }, { scope: panelRef, dependencies: [onClose, triggerRef], revertOnUpdate: true });

  useEffect(() => {
    driveRef.current?.(open);
  }, [open]);

  return (
    <dialog
      aria-label={uiCopy.mainMenu}
      aria-modal="true"
      data-lenis-prevent
      className={styles.panel}
      id="fullscreen-navigation"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={panelRef}
    >
      <div className={styles.panelTop}>
        <Container className={styles.bar}>
          <span className={styles.identity}>
            {profile.shortName}<span aria-hidden="true" className={styles.identityDot}>.</span>
          </span>
          <button className={styles.menuButton} onClick={onClose} type="button">{uiCopy.close}</button>
        </Container>
      </div>
      <Container className={styles.panelContent}>
        <nav aria-label={uiCopy.primaryNavigation}>
          <ol className={styles.list}>
            {items.map((item) => {
              const section = item.href.slice(1) as SectionId;
              return (
                <li data-menu-item key={item.href}>
                  <a
                    aria-current={activeSection === section ? "location" : undefined}
                    className={styles.link}
                    href={item.href}
                    onClick={(event) => {
                      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      pendingAnchorRef.current = item.href;
                      onNavigate(section);
                      // Repeated close requests must not restart the exit.
                      driveRef.current?.(false);
                      onClose();
                    }}
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>
    </dialog>
  );
}
