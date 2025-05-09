import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface SectionWrapperProps extends HTMLAttributes<HTMLElement> {
  id: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export default function SectionWrapper({
  id,
  title,
  subtitle,
  children,
  className,
  titleClassName,
  subtitleClassName,
  ...props
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24", className)}
      {...props}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        {title && (
          <h2 className={cn("text-3xl font-bold tracking-tight text-center text-primary sm:text-4xl mb-4", titleClassName)}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className={cn("mt-2 text-lg text-center text-muted-foreground mb-12", subtitleClassName)}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
