import Image from "next/image";

import { Container } from "@/components/ui";
import { graduation } from "@/data/graduation";
import { ContactPanel } from "./contact-panel";
import { GraduationEntrance } from "./graduation-entrance";
import { ClosingSection } from "./closing-section";
import styles from "./contact-section.module.css";

export function ContactSection() {
  return (
    <section
      aria-labelledby="contact-heading"
      className={`${styles.section} relative flex min-h-svh scroll-mt-18 flex-col overflow-clip pt-(--section-space)`}
      id="contact"
    >
      <Container className="relative flex flex-1 flex-col">
        <h2 className="sr-only" id="contact-heading">Sebuah perjalanan, sebuah pencapaian</h2>
        <div className={styles.graduation} data-graduation>
          <figure className={styles.photo} data-graduation-photo>
            {graduation.imageSrc ? (
              <Image alt={graduation.imageAlt} className={styles.photoImage} fill
                sizes="(min-width: 896px) 35vw, (min-width: 640px) 448px, 100vw"
                src={graduation.imageSrc} />
            ) : (
              <div aria-label="Placeholder foto wisuda" className={styles.placeholder} role="img" />
            )}
          </figure>
          <figure className={styles.reflection}>
            <span aria-hidden="true" className={styles.quoteMark} data-graduation-copy>“</span>
            <blockquote className={styles.quote} data-graduation-copy><p>{graduation.quote}</p></blockquote>
          </figure>
        </div>
        <GraduationEntrance />
      </Container>

      <div className={styles.contactLayers}>
        <ClosingSection />
        <ContactPanel />
      </div>
    </section>
  );
}
