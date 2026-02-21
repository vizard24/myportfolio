
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAdminMode } from '@/context/admin-mode-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion, useScroll } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Experience', href: '/#experience' },
  { name: 'Skills', href: '/#skills' },
  { name: 'Contact', href: '/#contact' },
];

const adminNavItems = [
  { name: 'Admin Dashboard', href: '/admin' },
  { name: 'Networking', href: '/networking' },
  { name: 'Job Finder', href: '/job-finder' },
  { name: 'App Tracker', href: '/application-tracker' }
]

export default function Header() {
  const { isAdminMode } = useAdminMode();
  const { scrollYProgress, scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest: number) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  const allNavItems = isAdminMode ? [...navItems, ...adminNavItems] : navItems;

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-border shadow-sm supports-[backdrop-filter]:bg-background/40"
            : "bg-transparent border-b-transparent"
        )}
      >
        <div className={cn(
          "container flex max-w-screen-2xl items-center transition-all duration-300",
          isScrolled ? "h-14" : "h-20"
        )}>
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block text-primary pl-4">
              Yaovi Portfolio
            </span>
          </Link>
          <nav className="hidden flex-1 items-center space-x-4 md:flex">
            {allNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium text-foreground/80 transition-colors hover:text-primary group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 pt-6">
                  {allNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <motion.div
          className="h-[2px] bg-gradient-to-r from-primary via-purple-500 to-accent origin-left"
          style={{ scaleX: scrollYProgress }}
        />
      </motion.header>
      {/* Invisible spacer to prevent content from hiding behind the fixed header */}
      <div className="h-20 flex-shrink-0" aria-hidden="true" />
    </>
  );
}
