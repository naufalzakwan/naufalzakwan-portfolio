import { uiCopy } from "@/data/site-content";

import { MotionController } from "@/components/animation";
import { HeroEntrance } from "@/components/animation/hero-entrance";
import { Navbar } from "@/components/layout";
import { LifeJourneySection } from "@/components/sections/life-journey-section";
import styles from "./page.module.css";
import {
  AboutSection,
  BeyondSection,
  CapabilitiesSection,
  ContactSection,
  HeroSection,
  JourneySection,
  ProcessSection,
  ProjectsSection,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <HeroEntrance />
      <a
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-(--radius-sm) bg-accent px-4 py-3 text-sm font-semibold text-accent-ink transition-transform focus:translate-y-0"
        href="#main-content"
      >
        {uiCopy.skipToContent}
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <JourneySection />
        <ProjectsSection />
        <CapabilitiesSection />
        <div className={styles.musicStack} data-music-stack-sections>
          <ProcessSection />
          <BeyondSection />
        </div>
        <LifeJourneySection />
        <ContactSection />
      </main>
      <MotionController />
    </>
  );
}
