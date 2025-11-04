
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
  headerActions?: React.ReactNode;
}

export function SectionWrapper({
  id,
  title,
  subtitle,
  children,
  className,
  titleClassName,
  subtitleClassName,
  headerActions,
  ...props
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24", className)}
      {...props}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        {(title || subtitle || headerActions) && (
            <div className="mb-12 text-center">
            {title && (
                <div className="flex justify-center items-center gap-4">
                    <h2 className={cn("text-3xl font-bold tracking-tight text-primary sm:text-4xl", titleClassName)}>
                        {title}
                    </h2>
                    {headerActions}
                </div>
            )}
            {subtitle && (
                <p className={cn("mt-2 text-lg text-muted-foreground", subtitleClassName)}>
                {subtitle}
                </p>
            )}
            </div>
        )}
        {children}
      </div>
    </section>
  );
}
