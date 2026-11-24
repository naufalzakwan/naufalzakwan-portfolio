export type SectionId =
  | "hero"
  | "about"
  | "asal-saya"
  | "tempat-lahir"
  | "story-family"
  | "zodiak-saya"
  | "jejak-perjalanan"
  | "connect"
  | "journey"
  | "works"
  | "capabilities"
  | "process"
  | "beyond"
  | "contact";

export type NavigationItem = Readonly<{
  label: string;
  href: `#${SectionId}`;
}>;

export type SocialPlatform = "github" | "linkedin" | "instagram" | "tiktok";

export type SocialLink = Readonly<{
  platform: SocialPlatform;
  label: string;
  href: `https://${string}`;
}>;

export type Profile = Readonly<{
  fullName: string;
  shortName: string;
  professionalTitle: string;
  location: string;
  locationLabel: string;
  age: number;
  education: string;
  institution: string;
  currentStatus: string;
}>;

export type ContentSection = Readonly<{
  heading: string;
  paragraphs: readonly string[];
}>;

export type HeroContent = ContentSection &
  Readonly<{
    eyebrow: string;
    primaryCta: Readonly<{ label: string; href: "#works" }>;
    secondaryCta: Readonly<{ label: string; href: "#contact" }>;
  }>;

export type Capability = "HTML" | "CSS" | "JavaScript" | "React" | "Next.js" | "Flutter" | "TypeScript" | "GSAP" | "Figma" | "ChatGPT" | "Claude";

export type ProcessStep = Readonly<{
  number: `0${1 | 2 | 3 | 4}`;
  title: "Kenali" | "Rencanakan" | "Bangun" | "Sempurnakan";
  description: string;
}>;

export type ProjectStatus = "verified" | "needs-owner-input";

export type ImageAsset = Readonly<{
  src: `/${string}`;
  alt: string;
}>;

export type Project = Readonly<{
  name: string;
  summary: string;
  status: ProjectStatus;
  description?: string;
  contribution?: string;
  technologies?: readonly string[];
  repositoryUrl?: `https://${string}`;
  liveUrl?: `https://${string}`;
  imageSrc?: `/${string}`;
}>;
