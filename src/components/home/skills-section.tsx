
import { skillsData, type SkillCategory, type Skill } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAdminMode } from '@/context/admin-mode-context';
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle } from 'lucide-react';

function SkillItem({ skill }: { skill: Skill }) {
  const Icon = skill.icon;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          {Icon && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Icon className="h-5 w-5 text-primary" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{skill.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <span className="text-sm font-medium text-foreground">{skill.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">{skill.level}%</span>
      </div>
      <Progress value={skill.level} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-[#FFA07A] [&>div]:to-[#FFDAB9]" />
    </div>
  );
}

function SkillCategoryCard({ category }: { category: SkillCategory }) {
  const { isAdminMode } = useAdminMode();
  return (
    <Card className="shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative">
      {isAdminMode && (
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-primary">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary text-center">{category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {category.skills.map((skill) => (
          <SkillItem key={skill.id} skill={skill} />
        ))}
      </CardContent>
    </Card>
  );
}

export default function SkillsSection() {
    const { isAdminMode } = useAdminMode();
  return (
    <SectionWrapper 
        id="skills" 
        title="Technical Skills" 
        subtitle="A snapshot of my expertise across various technologies."
        headerActions={
            isAdminMode ? (
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Skill Category
              </Button>
            ) : null
        }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {skillsData.map((category) => (
          <SkillCategoryCard key={category.id} category={category} />
        ))}
      </div>
    </SectionWrapper>
  );
}
