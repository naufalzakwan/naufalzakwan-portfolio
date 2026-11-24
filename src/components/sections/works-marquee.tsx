import localFont from "next/font/local";

import styles from "./works-marquee.module.css";

const marqueeDisplay = localFont({
  src: "../../../public/fonts/anton/Anton-Regular.ttf",
  variable: "--font-marquee-display",
  display: "swap",
});

export function WorksMarquee() {
  return (
    <footer className={`${marqueeDisplay.variable} ${styles.marquee}`} data-works-marquee>
      <p className="sr-only">Karya Saya</p>
      <div aria-hidden="true" className={styles.track} data-marquee-track>
        {[0, 1].map((group) => (
          <div className={styles.group} data-marquee-group key={group}>
            {[0, 1, 2].map((copy) => <span key={copy}>KARYA SAYA</span>)}
          </div>
        ))}
      </div>
    </footer>
  );
}
