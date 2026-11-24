"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui";
import { navigation, uiCopy } from "@/data/site-content";
import type { SectionId } from "@/types";

import { FullscreenMenu } from "./mobile-menu";
import styles from "./navigation.module.css";

const sectionIds = navigation.map((item) => item.href.slice(1) as SectionId);

export function Navbar() {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(true);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    let frame = 0;
    let lastScrollY = window.scrollY;
    let direction = 0;
    let travel = 0;

    function updateNavigationState() {
      // Accumulate small movements in one direction; ignore overscroll bounce.
      const scrollY = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
      const delta = scrollY - lastScrollY;
      if (menuOpen || scrollY <= 10) {
        setMenuVisible(true);
        direction = 0;
        travel = 0;
      } else if (delta !== 0) {
        const nextDirection = Math.sign(delta);
        travel = nextDirection === direction ? travel + Math.abs(delta) : Math.abs(delta);
        direction = nextDirection;
        if (travel >= 10) setMenuVisible(direction < 0);
      }
      lastScrollY = scrollY;
      const marker = window.scrollY + Math.min(window.innerHeight * 0.35, 280);
      let current: SectionId = "hero";
      let closestStart = -Infinity;

      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (!section) continue;
        // Destinations can be nested inside About/Beyond. offsetTop is relative
        // to their positioned parent, rather than the whole document.
        const start = section.getBoundingClientRect().top + window.scrollY;
        if (start <= marker && start >= closestStart) {
          current = id;
          closestStart = start;
        }
      }

      setActiveSection(current);
      frame = 0;
    }

    function handleScroll() {
      if (!frame) frame = window.requestAnimationFrame(updateNavigationState);
    }

    updateNavigationState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener("hashchange", closeMenu);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("hashchange", closeMenu);
    };
  }, [closeMenu, menuOpen]);

  return (
    <>
      <header className={styles.header}>
        <Container className={styles.bar}>
          <div className={styles.menuVisibility} data-menu-visible={menuVisible} inert={!menuVisible}>
          <button
            aria-controls="fullscreen-navigation"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            className={styles.menuButton}
            data-hero-entrance="menu"
            onClick={() => setMenuOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            {uiCopy.menu}
          </button>
          </div>
        </Container>
      </header>
      {/* showModal places the navigation dialog in the browser's top layer. */}
      <FullscreenMenu
        activeSection={activeSection}
        items={navigation}
        onClose={closeMenu}
        onNavigate={setActiveSection}
        open={menuOpen}
        triggerRef={menuButtonRef}
      />
      <noscript>
        <nav aria-label={uiCopy.noScriptNavigation} className={styles.fallback}>
          {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
      </noscript>
    </>
  );
}
