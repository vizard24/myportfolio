
import { personalInfo } from '@/data/portfolio-data';
import { Github, Linkedin, Mail, Shield, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAdminMode } from '@/context/admin-mode-context';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { toggleAdminMode } = useAdminMode();
  const { user, loading } = useAuth();

  const isAdminMode = !!user;

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {currentYear} {personalInfo.name}. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={toggleAdminMode} variant={isAdminMode ? "secondary" : "ghost"} size="sm" disabled={loading}>
            {isAdminMode ? (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </>
            )}
          </Button>
          <Link href={personalInfo.contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <Link href={personalInfo.contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <Link href={`mailto:${personalInfo.contact.email}`} aria-label="Email">
            <Mail className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
