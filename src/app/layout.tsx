import type { Metadata, Viewport } from "next";
import { Shantell_Sans } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

// Shantell Sans is a "variable font", meaning one file covers all
// weights (light through extra-bold). Because of that, we don't need
// to list individual weights here — normal, medium, semibold, and bold
// all keep working exactly like they did with Inter.
const shantellSans = Shantell_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-shantell-sans",
});

export const metadata: Metadata = {
    title: "mx-prototype",
    description: "A prototype for a future React app — Next.js + Untitled UI + Tailwind v4",
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cx(shantellSans.variable, "bg-primary antialiased")}>
                <RouteProvider>
                    <Theme>{children}</Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
