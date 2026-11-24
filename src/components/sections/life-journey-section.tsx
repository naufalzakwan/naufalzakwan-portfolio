import { Container, SectionHeading } from "@/components/ui";

// Navigation destination only: chronological life details await the owner.
export function LifeJourneySection() {
  return (
    <section aria-labelledby="life-journey-heading" className="scroll-mt-18 bg-black py-(--section-space)" id="jejak-perjalanan">
      <Container>
        <SectionHeading data-heading-reveal="journey" id="life-journey-heading" style={{ marginInline: "auto", textAlign: "center" }}>Jejak Perjalanan</SectionHeading>
      </Container>
    </section>
  );
}
