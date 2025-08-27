
"use client";

import { usePortfolioData } from '@/context/portfolio-data-context';
import { Github, Linkedin, Mail, LogIn, LogOut, Instagram } from 'lucide-react';
import Link from 'next/link';
import { useAdminMode } from '@/context/admin-mode-context';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';


const XIcon = (props: React.ComponentProps<'svg'>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.479l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );

const MediumIcon = (props: React.ComponentProps<'svg'>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0"
        {...props}
    >
        <path d="M7.45,4.01c0-2.2,1.8-4,4-4s4,1.8,4,4s-1.8,4-4,4S7.45,6.21,7.45,4.01z M19.43,20c0,1.1-0.9,2-2,2s-2-0.9-2-2 s0.9-2,2-2S19.43,18.9,19.43,20z M4.5,4.01c0-2.2,1.8-4,4-4s4,1.8,4,4s-1.8,4-4,4S4.5,6.21,4.5,4.01z M22.42,20 c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S22.42,18.9,22.42,20z M1.49,4.01c0-2.2,1.8-4,4-4s4,1.8,4,4s-1.8,4-4,4S1.49,6.21,1.49,4.01z M15.44,20c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S15.44,18.9,15.44,20z" />
    </svg>
);

const SubstackIcon = (props: React.ComponentProps<'svg'>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0"
        {...props}
    >
        <path d="M22.48,7.99l-7.96,4.64v4.71l7.96,-4.61v-4.74zM1.52,7.99l7.96,4.64v4.71l-7.96,-4.61v-4.74zM12,1.51l-7.96,4.62l7.96,4.61l7.96,-4.61l-7.96,-4.62z"/>
    </svg>
);

const DiscordIcon = (props: React.ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0"
        {...props}
    >
        <path d="M20.22,4.31A1.12,1.12,0,0,0,19,4H5a1.12,1.12,0,0,0-1.22.31,1.18,1.18,0,0,0-.36,1.22l1.6,7.56A1.14,1.14,0,0,0,6.2,14H17.8a1.14,1.14,0,0,0,1.12-1.09l1.6-7.56a1.18,1.18,0,0,0-.36-1.22m-3.44,4.45a1,1,0,1,1-1-1A1,1,0,0,1,16.78,8.76m-6.44,0a1,1,0,1,1-1-1A1,1,0,0,1,10.34,8.76m-3-1.88A1,1,0,1,1,6.2,6.76,1,1,0,0,1,7.34,6.88" />
    </svg>
);

export const SocialIcons = ({ contact, iconClassName }: { contact: any; iconClassName?: string }) => {
    const socialPlatforms = [
      { key: 'github', link: contact.github, Icon: Github, label: 'GitHub' },
      { key: 'linkedin', link: contact.linkedin, Icon: Linkedin, label: 'LinkedIn' },
      { key: 'email', link: { url: `mailto:${contact.email.url}`, visible: contact.email.visible }, Icon: Mail, label: 'Email' },
      { key: 'twitter', link: contact.twitter, Icon: XIcon, label: 'X / Twitter'},
      { key: 'instagram', link: contact.instagram, Icon: Instagram, label: 'Instagram' },
      { key: 'medium', link: contact.medium, Icon: MediumIcon, label: 'Medium' },
      { key: 'substack', link: contact.substack, Icon: SubstackIcon, label: 'Substack' },
      { key: 'discord', link: contact.discord, Icon: DiscordIcon, label: 'Discord' },
    ];
  
    return (
      <>
        {socialPlatforms.map(({ key, link, Icon, label }) => {
          if (!link.url || !link.visible) return null;
          const isEmail = key === 'email';
          return (
            <Link 
              key={key} 
              href={link.url} 
              target={isEmail ? '_self' : '_blank'} 
              rel={isEmail ? '' : 'noopener noreferrer'} 
              aria-label={label}
            >
              <Icon className={`${iconClassName || 'h-6 w-6'} text-muted-foreground hover:text-primary transition-colors`} />
            </Link>
          );
        })}
      </>
    );
};


export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { personalInfo } = usePortfolioData();
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
          <SocialIcons contact={personalInfo.contact} />
        </div>
      </div>
    </footer>
  );
}
