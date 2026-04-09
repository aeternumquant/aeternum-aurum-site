import { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="relative group inline-block cursor-help">
      <span className="border-b border-dashed border-primary/50 text-foreground group-hover:text-primary transition-colors">
        {children}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-card border border-white/10 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl shadow-black/50 pointer-events-none text-left">
        <p className="text-xs text-muted-foreground font-sans leading-relaxed m-0 font-light normal-case tracking-normal">
          {content}
        </p>
      </div>
    </div>
  );
}
