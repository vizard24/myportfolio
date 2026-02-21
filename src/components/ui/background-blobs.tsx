"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function BackgroundBlobs() {
    const { scrollY } = useScroll();

    // We create an inverse scroll effect so that as you scroll down, the blobs move slightly to create a thoughtful parallax.
    const y1 = useTransform(scrollY, [0, 3000], [0, 300]);
    const y2 = useTransform(scrollY, [0, 3000], [0, -400]);
    const y3 = useTransform(scrollY, [0, 3000], [0, 200]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-full">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-primary/20 blur-[100px] mix-blend-screen dark:mix-blend-lighten"
                    animate={{
                        x: [0, 50, -20, 0],
                        y: [0, -50, 20, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </motion.div>

            <motion.div style={{ y: y2 }} className="absolute inset-0 w-full h-full">
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen dark:mix-blend-lighten"
                    animate={{
                        x: [0, -50, 30, 0],
                        y: [0, 50, -30, 0],
                        scale: [1, 1.2, 0.8, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </motion.div>

            <motion.div style={{ y: y3 }} className="absolute inset-0 w-full h-full">
                <motion.div
                    className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-purple-500/20 blur-[90px] mix-blend-screen dark:mix-blend-lighten"
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -100, 50, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </motion.div>
        </div>
    );
}
