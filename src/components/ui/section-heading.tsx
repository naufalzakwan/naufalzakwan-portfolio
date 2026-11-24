import type { HTMLAttributes, ReactNode } from "react";

type SectionHeadingProps = Readonly<
  {
    children: ReactNode;
  } & HTMLAttributes<HTMLHeadingElement>
>;

export function SectionHeading({ children, className = "", ...props }: SectionHeadingProps) {
  return (
    <h2
      className={`max-w-[18ch] font-display text-(length:--text-section) leading-[1.02] font-medium tracking-[-0.04em] ${className}`.trim()}
      data-motion-heading
      {...props}
    >
      {children}
    </h2>
  );
}
