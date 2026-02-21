"use client";

import React, { useState, useEffect } from 'react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { useTheme } from '@/context/theme-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Upload } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export function SettingsManager() {
    const { personalInfo, updatePersonalInfo } = useSimplePortfolio();
    const { toast } = useToast();
    const themeContext = useTheme();

    // Local state to bridge the slider and color picker accurately
    const [localColor, setLocalColor] = useState('#7c3aed');
    const [localRadius, setLocalRadius] = useState<number[]>([1.0]);

    useEffect(() => {
        if (themeContext.primaryColor) setLocalColor(themeContext.primaryColor);
        else setLocalColor('#7c3aed');

        if (themeContext.borderRadius !== null) setLocalRadius([themeContext.borderRadius]);
        else setLocalRadius([1.0]);
    }, [themeContext.primaryColor, themeContext.borderRadius]);

    const handleProfileVisibilityToggle = async (checked: boolean) => {
        try {
            await updatePersonalInfo({
                ...personalInfo,
                profilePictureVisible: checked
            });
            toast({ title: "Success", description: `Profile picture ${checked ? 'visible' : 'hidden'}` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setLocalColor(hex);
        themeContext.setPrimaryColor(hex);
    };

    const handleRadiusChange = (value: number[]) => {
        setLocalRadius(value);
        themeContext.setBorderRadius(value[0]);
    };

    const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                themeContext.setFavicon(url);
                toast({ title: "Favicon Updated", description: "Successfully updated favicon. It will persist across refreshes." });
            };
            reader.readAsDataURL(file);
        }
    };

    const resetTheme = () => {
        themeContext.resetTheme();
        toast({ title: "Theme Reset", description: "Default theme restored" });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Customization</CardTitle>
                    <CardDescription>Manage visibility and layout options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="show-profile-pic">Show Profile Picture</Label>
                            <p className="text-sm text-muted-foreground">Toggle visibility of your profile picture on the home page.</p>
                        </div>
                        <Switch
                            id="show-profile-pic"
                            checked={personalInfo.profilePictureVisible ?? true} // Default to true if undefined
                            onCheckedChange={handleProfileVisibilityToggle}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Theme & Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of your portfolio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex items-center gap-4">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-input shadow-sm">
                                <input
                                    type="color"
                                    id="primary-color"
                                    value={localColor}
                                    onChange={handleColorChange}
                                    className="absolute -top-2 -left-2 h-14 w-14 cursor-pointer p-0 border-0"
                                />
                            </div>
                            <span className="font-mono text-sm uppercase">{localColor}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Main color used for buttons, links, and accents.</p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label htmlFor="border-radius">UI Roundness</Label>
                        <div className="flex items-center gap-4">
                            <Slider
                                id="border-radius"
                                min={0}
                                max={2}
                                step={0.1}
                                value={localRadius}
                                onValueChange={handleRadiusChange}
                                className="flex-1"
                            />
                            <span className="font-mono text-sm w-12 text-right">{localRadius[0]}rem</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Adjust the border radius of cards, buttons, and inputs.</p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label>Favicon</Label>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => document.getElementById('favicon-upload')?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Favicon
                            </Button>
                            <input
                                id="favicon-upload"
                                type="file"
                                accept="image/x-icon,image/png,image/jpeg"
                                className="hidden"
                                onChange={handleFaviconUpload}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">Upload a square image (PNG, JPG, or ICO) to use as the site favicon.</p>
                    </div>

                    <Separator />

                    <div className="pt-2">
                        <Button variant="outline" onClick={resetTheme}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset to Defaults
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
