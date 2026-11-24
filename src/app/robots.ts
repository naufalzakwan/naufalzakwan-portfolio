import type { MetadataRoute } from "next";
import { isPreview } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", ...(isPreview ? { disallow: "/" } : { allow: "/" }) } };
}
