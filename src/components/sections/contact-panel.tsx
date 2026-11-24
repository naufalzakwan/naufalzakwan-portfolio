import { ArrowUp, ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/ui";
import { socialLinks, uiCopy } from "@/data/site-content";
import { LanyardLayout } from "./lanyard-layout";
import styles from "./contact-panel.module.css";

export function ContactPanel() {
  return (
    <section aria-labelledby="connect-heading" className={styles.panel} id="connect">
      <Container>
        <div className={styles.layout}>
          <div className={styles.hangingProfile} data-profile-hanger>
            <div aria-hidden="true" className={styles.strap} data-profile-strap />
            <svg aria-hidden="true" className={styles.lanyard} focusable="false" viewBox="0 0 28 28">
              <defs>
                <linearGradient id="contact-metal" x1="5" y1="3" x2="23" y2="25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#777b7c" /><stop offset=".22" stopColor="#f4f4ef" /><stop offset=".5" stopColor="#9a9e9e" /><stop offset=".78" stopColor="#e8e9e5" /><stop offset="1" stopColor="#727777" />
                </linearGradient>
              </defs>
              {/* A single reinforced eyelet sits inside the flat ribbon; its
                  folded attachment continues behind the badge header. */}
              <circle cx="14" cy="14" r="10" fill="#959b94" opacity=".35" />
              <circle cx="14" cy="13" r="8.5" fill="url(#contact-metal)" />
              <circle cx="14" cy="13" r="4.5" fill="#343934" stroke="#747b72" strokeWidth=".7" />
              <path d="M8 10a6.6 6.6 0 0 1 11-2" fill="none" stroke="#ffffffb0" strokeWidth=".8" strokeLinecap="round" />
            </svg>
            <aside aria-label="Profil pribadi" className={styles.profile} data-profile-badge>
            <div className={styles.badgeHeader}>
              <p className={styles.name}>MUHAMMAD NAUFAL ZAKWAN</p>
              <p className={styles.profession}>Front-end Developer</p>
            </div>
            <div className={styles.portrait}>
              <Image alt="Muhammad Naufal Zakwan" fill
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 448px, 100vw"
                src="/images/memories/latar_merah.png" />
            </div>
            </aside>
            <LanyardLayout />
          </div>

          <div className={styles.editorial}>
            <h2 className={styles.headline} id="connect-heading">
              <span>Terima kasih sudah mampir</span>{" "}
              menyusuri cerita saya. Mari bertukar kabar dan{" "}
              <span className={styles.amber}>terhubung di sini</span>
            </h2>
            <p className={styles.description}>
              Saya selalu terbuka untuk berbagi ide, membahas teknologi, dan menjajaki peluang kolaborasi baru.
              Kalau ada sesuatu yang ingin didiskusikan atau dikembangkan bersama, jangan ragu untuk terhubung.
            </p>
            <nav aria-label={uiCopy.contact.socialNavigation}>
              <ol className={styles.socials}>
                {socialLinks.map((link) => (
                  <li key={link.platform}>
                    <a className={styles.social} href={link.href} rel="noopener noreferrer" target="_blank">
                      <span className={styles.socialName}>{link.label}<span className="sr-only">{uiCopy.contact.newTab}</span></span>
                      <ArrowUpRight aria-hidden="true" size={23} strokeWidth={1.4} />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <footer className={styles.footer}>
              <a className={styles.back} href="#hero">{uiCopy.backToTop}<ArrowUp aria-hidden="true" size={16} strokeWidth={1.5} /></a>
            </footer>
          </div>
        </div>
      </Container>
    </section>
  );
}
