import type { HTMLAttributes } from "react";

type DividerProps = Readonly<HTMLAttributes<HTMLHRElement>>;

export function Divider({ className = "", ...props }: DividerProps) {
  return <hr className={`m-0 w-full border-0 border-t border-line ${className}`.trim()} {...props} />;
}
