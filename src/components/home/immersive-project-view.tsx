"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, techIcons } from '@/data/portfolio-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, ChevronLeft, ChevronRight, Share2, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ImmersiveProjectViewProps {
    projects: Project[];
    onEdit?: (project: Project) => void;
    onDelete?: (projectId: string) => void;
    isAdminMode: boolean;
}

export function ImmersiveProjectView({ projects, onEdit, onDelete, isAdminMode }: ImmersiveProjectViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % projects.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    };

    const currentProject = projects[currentIndex];

    if (!currentProject) return null;

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
            rotateY: direction > 0 ? 45 : -45,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: {
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
            rotateY: direction < 0 ? 45 : -45,
            transition: {
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        })
    };

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30 z-10 pointer-events-none" />

            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute w-full max-w-4xl px-4 perspective-1000"
                >
                    <Card className="w-full h-full overflow-hidden border-none shadow-2xl bg-card/90 backdrop-blur-sm transform-style-3d">
                        <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[500px]">
                            {/* Image Side */}
                            <div className="relative h-64 md:h-full w-full overflow-hidden group">
                                {currentProject.imageUrl ? (
                                    <Image
                                        src={currentProject.imageUrl}
                                        alt={currentProject.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                        <span className="text-muted-foreground">No Image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="text-2xl font-bold mb-1">{currentProject.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentProject.techStack.slice(0, 3).map(tech => (
                                            <Badge key={tech.name} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                                                {tech.name}
                                            </Badge>
                                        ))}
                                        {currentProject.techStack.length > 3 && (
                                            <Badge variant="secondary" className="bg-white/20 text-white border-none">+{currentProject.techStack.length - 3}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="p-6 md:p-8 flex flex-col justify-between">
                                <div>
                                    <CardHeader className="p-0 mb-4">
                                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                                            {currentProject.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <CardDescription className="text-base leading-relaxed mb-6">
                                            {currentProject.description}
                                        </CardDescription>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {currentProject.techStack.map(tech => {
                                                const Icon = tech.iconName ? techIcons[tech.iconName] : null;
                                                return (
                                                    <div key={tech.name} className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                                        {Icon && <Icon className="w-3 h-3" />}
                                                        {tech.name}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </div>

                                <CardFooter className="p-0 mt-auto flex gap-3">
                                    {currentProject.liveDemoUrl && (
                                        <Button asChild className="flex-1 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white shadow-lg shadow-purple-500/20">
                                            <Link href={currentProject.liveDemoUrl} target="_blank">
                                                <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                                            </Link>
                                        </Button>
                                    )}
                                    {currentProject.githubUrl && (
                                        <Button asChild variant="outline" className="flex-1 border-primary/20 hover:bg-primary/5">
                                            <Link href={currentProject.githubUrl} target="_blank">
                                                <Github className="mr-2 h-4 w-4" /> GitHub
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 md:left-8 z-20 h-12 w-12 rounded-full bg-background/60 backdrop-blur-md hover:bg-background/80 hover:scale-110 active:scale-95 transition-all shadow-lg border border-border/20"
                onClick={handlePrev}
            >
                <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 md:right-8 z-20 h-12 w-12 rounded-full bg-background/60 backdrop-blur-md hover:bg-background/80 hover:scale-110 active:scale-95 transition-all shadow-lg border border-border/20"
                onClick={handleNext}
            >
                <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {projects.map((_, idx) => (
                    <button
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-primary w-6' : 'bg-primary/30 hover:bg-primary/50'
                            }`}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
