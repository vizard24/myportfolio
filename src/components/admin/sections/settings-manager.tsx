"use client";

import React, { useState, useEffect } from 'react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

function hexToHSL(H: string) {
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = parseInt("0x" + H[1] + H[1]);
        g = parseInt("0x" + H[2] + H[2]);
        b = parseInt("0x" + H[3] + H[3]);
    } else if (H.length == 7) {
        r = parseInt("0x" + H[1] + H[2]);
        g = parseInt("0x" + H[3] + H[4]);
        b = parseInt("0x" + H[5] + H[6]);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}

export function SettingsManager() {
    const { personalInfo, updatePersonalInfo } = useSimplePortfolio();
    const { toast } = useToast();

    // Local state for color customization
    const [primaryColor, setPrimaryColor] = useState('#7c3aed'); // Default roughly matches purple
    const [borderRadius, setBorderRadius] = useState('0.5');

    // Load initial values (mocked, or from CSS)
    useEffect(() => {
        // In a real app we'd parse the computed style
        // const rootStyle = getComputedStyle(document.documentElement);
        // ...
    }, []);

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
        setPrimaryColor(hex);

        // Apply immediately to preview
        const hsl = hexToHSL(hex);
        document.documentElement.style.setProperty('--primary', hsl);
        document.documentElement.style.setProperty('--ring', hsl);
    };

    const resetTheme = () => {
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--ring');
        setPrimaryColor('#7c3aed');
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
                                    value={primaryColor}
                                    onChange={handleColorChange}
                                    className="absolute -top-2 -left-2 h-14 w-14 cursor-pointer p-0 border-0"
                                />
                            </div>
                            <span className="font-mono text-sm uppercase">{primaryColor}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Main color used for buttons, links, and accents.</p>
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
