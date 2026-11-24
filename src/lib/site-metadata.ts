import type { Metadata } from "next";

export const portfolioIdentity = {
  name: "Muhammad Naufal Zakwan",
  siteName: "Naufal Zakwan Portfolio",
  title: "Muhammad Naufal Zakwan | Front-end Developer",
  description: "Personal portfolio of Muhammad Naufal Zakwan — a Front-end Developer passionate about creative web experiences, interactive storytelling, and modern web development.",
} as const;

function publicUrl(value: string | undefined): URL | undefined {
  if (!value?.trim()) return undefined;
  const url = new URL(value.trim());
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an http(s) origin without credentials, a path, a query, or a fragment.");
  }
  return url;
}

// Set only after the new deployment exists. Never reuse a previous site's URL.
export const canonicalSiteUrl = publicUrl(process.env.SITE_URL);
const deploymentHost = process.env.VERCEL_ENV === "production"
  ? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  : process.env.VERCEL_URL;
const deploymentUrl = deploymentHost ? publicUrl(`https://${deploymentHost}`) : undefined;
export const isPreview = process.env.VERCEL_ENV === "preview";

export const portfolioMetadata: Metadata = {
  // Local fallback is for development social-image resolution, not a canonical URL.
  metadataBase: canonicalSiteUrl ?? deploymentUrl ?? new URL("http://localhost:3000"),
  title: portfolioIdentity.title,
  description: portfolioIdentity.description,
  applicationName: portfolioIdentity.siteName,
  authors: [{ name: portfolioIdentity.name, url: "https://github.com/naufalzakwan" }],
  creator: portfolioIdentity.name,
  ...(canonicalSiteUrl ? { alternates: { canonical: canonicalSiteUrl.toString() } } : {}),
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: portfolioIdentity.title,
    description: portfolioIdentity.description,
    siteName: portfolioIdentity.siteName,
    ...(canonicalSiteUrl ? { url: canonicalSiteUrl.toString() } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: portfolioIdentity.title,
    description: portfolioIdentity.description,
  },
  robots: { index: !isPreview, follow: !isPreview },
};
