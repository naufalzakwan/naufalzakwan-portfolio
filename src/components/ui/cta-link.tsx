import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type CtaLinkProps = Readonly<
  {
    children: ReactNode;
    direction?: "down" | "up-right";
    variant?: "accent" | "outline";
  } & AnchorHTMLAttributes<HTMLAnchorElement>
>;

export function CtaLink({
  children,
  className = "",
  direction = "up-right",
  variant = "outline",
  ...props
}: CtaLinkProps) {
  const Icon = direction === "down" ? ArrowDownRight : ArrowUpRight;
  const style = variant === "accent" ? { color: "var(--color-accent-ink-base)", ...props.style } : props.style;

  return (
    <a
      className={`group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-(--radius-md) border px-5 text-center text-[0.72rem] font-semibold tracking-[0.1em] uppercase transition-colors sm:w-auto ${
        variant === "accent"
          ? "border-accent bg-accent text-accent-ink hover:border-foreground hover:bg-foreground"
          : "border-line bg-transparent text-foreground hover:border-muted hover:bg-surface"
      } ${className}`.trim()}
      {...props}
      style={style}
    >
      <span>{children}</span>
      <Icon aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" size={16} strokeWidth={1.6} />
    </a>
  );
}
