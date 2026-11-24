import { Container, SectionHeading } from "@/components/ui";
import { capabilities } from "@/data/site-content";
import { TechnologyCards } from "./technology-cards";
import styles from "./capabilities-section.module.css";

export function CapabilitiesSection() {
  return (
    <section
      aria-labelledby="capabilities-heading"
      className="relative scroll-mt-18 bg-background py-(--section-space)"
      id="capabilities"
    >
      <Container>
        <SectionHeading className={styles.heading} data-heading-reveal="blur" id="capabilities-heading">
          Teknologi dan tools saya gunakan
        </SectionHeading>
        <TechnologyCards technologies={capabilities.items} />
      </Container>
    </section>
  );
}
