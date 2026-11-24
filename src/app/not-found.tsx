import { CtaLink } from "@/components/ui";
import { uiCopy } from "@/data/site-content";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-(--container-gutter) text-center">
      <h1 className="font-display text-4xl font-semibold">{uiCopy.notFound.heading}</h1>
      <p className="text-muted">{uiCopy.notFound.description}</p>
      <CtaLink href="/">{uiCopy.notFound.back}</CtaLink>
    </main>
  );
}
