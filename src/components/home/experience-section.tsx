import { experienceData, type Experience } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap } from 'lucide-react';

function ExperienceItem({ item }: { item: Experience }) {
  const Icon = item.icon || (item.type === 'work' ? Briefcase : GraduationCap);
  return (
    <div className="relative flex items-start pl-10 group">
      <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA07A] to-[#FFDAB9] ring-4 ring-background shadow-md">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </span>
      <Card className="ml-4 flex-1 overflow-hidden shadow-md rounded-lg transition-all duration-300 group-hover:shadow-xl transform group-hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">{item.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{item.institution} &bull; {item.dateRange}</p>
        </CardHeader>
        <CardContent>
          {typeof item.description === 'string' ? (
            <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 leading-relaxed">
              {item.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExperienceSection() {
  return (
    <SectionWrapper id="experience" title="My Journey" subtitle="Education and professional experience that shaped my career." className="bg-secondary/50">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border hidden md:block" aria-hidden="true"></div>
        
        <div className="space-y-12">
          {experienceData.map((item) => (
            <ExperienceItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
