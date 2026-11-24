import { Container } from "@/components/ui";
import { projects, uiCopy } from "@/data/site-content";
import { ProjectGallery } from "./project-gallery";
import { AdminShowcase } from "./admin-showcase";
import { ProjectTextReveal } from "./project-text-reveal";
import styles from "./projects-section.module.css";

const project = projects[0];
const adminScreenshots = [
  { src: "/images/projects/admin_egggym/paket_member.webp", alt: "Halaman paket membership web Admin EGGGYM" },
  { src: project.imageSrc, alt: "Dashboard Admin EGGGYM dengan ringkasan member, trainer, booking, dan keanggotaan" },
  { src: "/images/projects/admin_egggym/laporan.webp", alt: "Halaman laporan operasional web Admin EGGGYM" },
];

export function ProjectsSection() {
  return (
    <section aria-labelledby="works-heading" className="scroll-mt-18 bg-background py-(--section-space)" id="works">
      <Container>
        <h2 className="sr-only" id="works-heading">{uiCopy.works.heading}</h2>
        <article aria-labelledby="egggym-title" className={styles.split}>
          <AdminShowcase images={adminScreenshots} />
          <div className={styles.content} data-egggym-content>
            <h3 className={styles.title} data-egggym-reveal id="egggym-title">{project.name}</h3>
            <p className={styles.summary} data-egggym-reveal>{project.summary}</p>
            <p className={styles.description} data-egggym-reveal>
              Egg Gym adalah aplikasi berbasis mobile dan web untuk mendigitalisasi pengelolaan pusat kebugaran. Sistem ini mengintegrasikan manajemen membership, pembayaran digital, booking Personal Trainer multi-sesi, program latihan progresif, hingga laporan terpusat bagi Admin, Member, dan Personal Trainer.
            </p>
            <ProjectGallery />
          </div>
        </article>
        <ProjectTextReveal />
      </Container>
    </section>
  );
}
