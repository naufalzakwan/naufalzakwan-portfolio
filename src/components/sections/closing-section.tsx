import { ArrowUpRight } from "lucide-react";

import { closing } from "@/data/closing";
import styles from "./closing-section.module.css";

export function ClosingSection() {
  return (
    <section aria-labelledby="closing-heading" className={styles.section} id="closing">
      <div aria-hidden="true" className={styles.atmosphere}>
        <div className={styles.rotor}>
          <div className={styles.glow} />
        </div>
      </div>
      <div className={styles.content}>
        <span aria-hidden="true" className={styles.spark}>✦</span>
        <h2 className={styles.message} id="closing-heading">{closing.message}</h2>
        <div className={styles.linksArea} data-closing-links>
          {closing.links.length > 0 && (
            <nav aria-label="Kenalan lebih jauh" className={styles.links}>
              {closing.links.map((link) => (
                <a className={styles.link} href={link.href} key={link.href}>
                  {link.label}
                  <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.5} />
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
