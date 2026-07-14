"use client";

// Icons come from two libraries with a clear hierarchy (see ARCHITECTURE.md, Decision 3):
// 1. @untitledui/icons is the default — it matches the Untitled UI Figma library.
// 2. @phosphor-icons/react supplements it, only for icons Untitled UI lacks.
import { Sparkle } from "@phosphor-icons/react";
import { ArrowRight, CheckCircle } from "@untitledui/icons";
// Untitled UI components live in src/components — Button is a real library
// component (built on React Aria), not a plain HTML button.
import { Button } from "@/components/base/buttons/button";
import { BadgeWithDot } from "@/components/base/badges/badges";

export const HomeScreen = () => {
    return (
        <div className="flex h-dvh flex-col items-center justify-center gap-6 px-4 md:px-8">
            {/* Untitled UI Badge component — "color" and "size" are props,
                like variant properties on a Figma component. */}
            <BadgeWithDot color="success" size="lg">
                Skeleton deployed
            </BadgeWithDot>

            <h1 className="max-w-3xl text-center text-display-sm font-semibold text-primary">mx-prototype</h1>

            <p className="max-w-xl text-center text-lg text-tertiary">
                A working Next.js + UntitledUI React Library + Tailwind v4 skeleton. This page is the smoke test: if you can read this, the stack works.
            </p>

            {/* Smoke-test checklist: each row proves one part of the stack renders. */}
            <ul className="flex flex-col gap-2 text-md text-secondary">
                <li className="flex items-center gap-2">
                    {/* Untitled UI icon (the default icon set) */}
                    <CheckCircle className="size-5 text-fg-success-primary" />
                    Untitled UI component + icon rendering
                </li>
                <li className="flex items-center gap-2">
                    {/* Phosphor icon (the supplemental set) — "weight" is
                        Phosphor's style prop, like an icon variant in Figma. */}
                    <Sparkle weight="fill" className="size-5 text-fg-brand-primary" />
                    Phosphor icon rendering
                </li>
            </ul>

        </div>
    );
};
