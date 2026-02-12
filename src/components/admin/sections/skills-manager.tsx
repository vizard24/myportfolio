"use client";

import React, { useState } from 'react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Skill, SkillCategory } from '@/data/portfolio-data';

export function SkillsManager() {
    const { skills, updateSkills } = useSimplePortfolio();
    const { toast } = useToast();

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [addingSkillTo, setAddingSkillTo] = useState<string | null>(null);

    const [skillForm, setSkillForm] = useState<{ name: string, level: string }>({ name: '', level: '80' });

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        const newCategory: SkillCategory = {
            id: `cat-${Date.now()}`,
            name: newCategoryName,
            skills: []
        };

        const updatedSkills = [...skills, newCategory];
        await updateSkills(updatedSkills);
        setNewCategoryName('');
        setIsAddingCategory(false);
        toast({ title: "Success", description: "Category added" });
    };

    const handleDeleteCategory = async (catId: string) => {
        const updatedSkills = skills.filter(cat => cat.id !== catId);
        await updateSkills(updatedSkills);
        toast({ title: "Success", description: "Category deleted" });
    };

    const handleAddSkill = async (catId: string) => {
        if (!skillForm.name.trim()) return;

        const newSkill: Skill = {
            id: `skill-${Date.now()}`,
            name: skillForm.name,
            level: parseInt(skillForm.level) || 0,
            iconName: 'Default' // Default for now
        };

        const updatedSkills = skills.map(cat => {
            if (cat.id === catId) {
                return { ...cat, skills: [...cat.skills, newSkill] };
            }
            return cat;
        });

        await updateSkills(updatedSkills);
        setSkillForm({ name: '', level: '80' });
        setAddingSkillTo(null);
        toast({ title: "Success", description: "Skill added" });
    };

    const handleDeleteSkill = async (catId: string, skillId: string) => {
        const updatedSkills = skills.map(cat => {
            if (cat.id === catId) {
                return { ...cat, skills: cat.skills.filter(s => s.id !== skillId) };
            }
            return cat;
        });

        await updateSkills(updatedSkills);
        toast({ title: "Success", description: "Skill deleted" });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Skills Management</h2>
                <Button onClick={() => setIsAddingCategory(true)} disabled={isAddingCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {isAddingCategory && (
                <Card className="border-dashed border-2">
                    <CardContent className="pt-6 flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="cat-name">Category Name</Label>
                            <Input
                                id="cat-name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g. Frontend, Backend, Tools"
                            />
                        </div>
                        <Button onClick={handleAddCategory}>Save</Button>
                        <Button variant="ghost" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6">
                {skills.map((category) => (
                    <Card key={category.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setAddingSkillTo(category.id)}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Skill
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCategory(category.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {category.skills.map((skill) => (
                                    <Badge key={skill.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-2 text-sm">
                                        {skill.name} <span className="text-xs opacity-70">({skill.level}%)</span>
                                        <button
                                            onClick={() => handleDeleteSkill(category.id, skill.id)}
                                            className="ml-1 hover:text-destructive transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {category.skills.length === 0 && (
                                    <span className="text-sm text-muted-foreground italic">No skills in this category yet.</span>
                                )}
                            </div>

                            {addingSkillTo === category.id && (
                                <div className="flex gap-2 items-end mt-4 p-4 bg-muted/50 rounded-md">
                                    <div className="flex-1">
                                        <Label htmlFor={`skill-name-${category.id}`}>Skill Name</Label>
                                        <Input
                                            id={`skill-name-${category.id}`}
                                            value={skillForm.name}
                                            onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                                            placeholder="e.g. React"
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Label htmlFor={`skill-level-${category.id}`}>Level (%)</Label>
                                        <Input
                                            id={`skill-level-${category.id}`}
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={skillForm.level}
                                            onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                                            className="h-8"
                                        />
                                    </div>
                                    <Button size="sm" onClick={() => handleAddSkill(category.id)}>Add</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setAddingSkillTo(null)}>Cancel</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
