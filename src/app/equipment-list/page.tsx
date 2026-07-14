"use client";

// Equipment list screen — replicated from the Figma mockup (node 224:18806).
// Everything on this page is assembled from Untitled UI components that
// already live in src/components/.

import { useEffect, useState } from "react";
import { ChevronDown, Edit01, FilterLines, Moon01, SearchLg, Sun } from "@untitledui/icons";
import { useTheme } from "next-themes";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import { EquipmentDetailSlideout } from "./equipment-detail-slideout";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

// Coverage drives the colored status pill. Each status maps to a badge color
// below (like a Figma variant property on the Badge component).
type Coverage = "active" | "expiring" | "expired" | "none";

interface Equipment {
    id: string;
    company: string;
    designName: string;
    order: string;
    designId: string;
    // The MachineMotion serial chips. `extraMachines` renders the "+N" chip.
    machine: string;
    extraMachines?: number;
    subscription: string;
    coverage: Coverage;
    // Expiration is two stacked lines: the date, and a supporting note.
    expirationDate?: string;
    expirationNote?: string;
}

// The 8 rows from the mockup, top to bottom.
const equipments: Equipment[] = [
    {
        id: "1,437",
        company: "Pacific Northwest",
        designName: "3330mm 7th axis with robot",
        order: "87,110",
        designId: "508,945",
        machine: "MM2-2024-00601",
        subscription: "Monitor",
        coverage: "active",
        expirationDate: "2028-03-10",
        expirationNote: "in 610 days",
    },
    {
        id: "1,436",
        company: "Utility Global",
        designName: "Ceramic spraying system",
        order: "86,873",
        designId: "481,045",
        machine: "MM2-2024-00455",
        extraMachines: 3,
        subscription: "Monitor",
        coverage: "active",
        expirationDate: "2027-05-01",
        expirationNote: "in 296 days",
    },
    {
        id: "1,435",
        company: "Utility Global",
        designName: "Ceramic spraying system",
        order: "86,873",
        designId: "481,045",
        machine: "MM2-2024-00601",
        subscription: "Diagnose",
        coverage: "expiring",
        expirationDate: "2026-07-28",
        expirationNote: "in 42 days",
    },
    {
        id: "1,434",
        company: "Utility Global",
        designName: "Ceramic spraying system",
        order: "86,873",
        designId: "481,045",
        machine: "MM2-2024-00601",
        extraMachines: 1,
        subscription: "Rapide Care",
        coverage: "active",
        expirationDate: "2027-05-01",
        expirationNote: "in 126 days",
    },
    {
        id: "1,433",
        company: "Utility Global",
        designName: "Ceramic spraying system",
        order: "86,873",
        designId: "481,045",
        machine: "MM2-2024-00601",
        extraMachines: 1,
        subscription: "Monitor",
        coverage: "expired",
        expirationDate: "2026-03-10",
        expirationNote: "Expired",
    },
    {
        id: "1,432",
        company: "Custom Control",
        designName: "Gantry Range Extender",
        order: "86,750",
        designId: "508,775",
        machine: "MM2-2024-00601",
        subscription: "Diagnose",
        coverage: "active",
        expirationDate: "2026-03-10",
        expirationNote: "in 90 days",
    },
    {
        id: "1,431",
        company: "The Timken Company",
        designName: "Through Feed ROAI",
        order: "86,674",
        designId: "490,139",
        machine: "MM2-2024-00601",
        subscription: "None",
        coverage: "none",
    },
    {
        id: "1,430",
        company: "Parker Hannifin",
        designName: "Robot 7th axis",
        order: "86,681",
        designId: "493,756",
        machine: "MM2-2024-00601",
        subscription: "None",
        coverage: "active",
        expirationDate: "2026-03-10",
        expirationNote: "in 90 days",
    },
];

// Maps each coverage status to a BadgeWithDot color + label
// (green = Active, yellow = Expiring, red = Expired, gray = None).
const coverageBadge: Record<Coverage, { color: "success" | "warning" | "error" | "gray"; label: string }> = {
    active: { color: "success", label: "Active" },
    expiring: { color: "warning", label: "Expiring" },
    expired: { color: "error", label: "Expired" },
    none: { color: "gray", label: "None" },
};

// Compact table cell styles so all 10 columns fit without a horizontal
// scrollbar on laptop screens: 16px side padding (instead of 24px) and
// 12px text (instead of 14px). Same idea as tightening auto-layout
// padding + dropping one type size in Figma.
const headStyles = "px-4";
// Cell text is 12px on laptops, back to 14px on wide screens (1536px+)
// where the table has room to spare.
const cellStyles = "px-4 text-xs 2xl:text-sm";

// The filter tabs above the table, and how each one narrows down the rows.
const filterTabs = [
    { id: "all", label: "All equipments" },
    { id: "no-subscription", label: "No subscription" },
    { id: "expiring-soon", label: "Expiring soon" },
    { id: "expired", label: "Expired" },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const navItems = ["Sales tools", "Ressources", "Parts", "Designs", "Organizations", "Admin"];

// Small icon button that flips the app between light and dark mode.
// It shows a moon while in light mode ("switch me to dark") and a sun
// while in dark mode ("switch me back to light").
function ThemeToggle() {
    // `resolvedTheme` is the mode currently applied ("light" or "dark"),
    // even when the user's choice is "follow the system setting".
    const { resolvedTheme, setTheme } = useTheme();

    // The server doesn't know the visitor's theme, so we wait until the
    // component is mounted in the browser before showing the real icon.
    // This avoids a mismatch between server and browser HTML (a
    // "hydration error" — the warning you may have seen in dev tools).
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <ButtonUtility
            size="sm"
            color="tertiary"
            icon={isDark ? Sun : Moon01}
            tooltip={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onPress={() => setTheme(isDark ? "light" : "dark")}
        />
    );
}

export default function EquipmentListPage() {
    // Which filter tab is selected (defaults to "All equipments").
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    // Current text typed in the search field.
    const [searchQuery, setSearchQuery] = useState("");
    // The row whose pen button was clicked (null until the first click).
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    // Whether the "Equipment detail" slideout panel is visible.
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

    // Apply the selected tab first, then the search text on top of it.
    const visibleEquipments = equipments
        .filter((item) => {
            if (selectedFilter === "no-subscription") return item.subscription === "None";
            if (selectedFilter === "expiring-soon") return item.coverage === "expiring";
            if (selectedFilter === "expired") return item.coverage === "expired";
            return true;
        })
        .filter((item) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                item.company.toLowerCase().includes(query) ||
                item.designName.toLowerCase().includes(query) ||
                item.machine.toLowerCase().includes(query)
            );
        });

    return (
        <div className="flex min-h-dvh flex-col bg-primary">
            {/* Header navigation — lo-fi wordmark plus the six nav links */}
            <header className="flex h-16 w-full items-center border-b border-secondary bg-primary">
                {/* Side padding scales with the viewport: 32px on laptops, 112px
                    only on true 1920px displays (matching the Figma margins). */}
                <div className="flex w-full items-center gap-10 px-8 2xl:px-28">
                    <a href="/" className="text-md font-bold tracking-[0.3em] text-primary">
                        VENTION
                    </a>

                    <nav>
                        <ul className="flex items-center gap-0.5">
                            {navItems.map((label) => (
                                <li key={label}>
                                    <a
                                        href="#"
                                        className="flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold text-secondary transition duration-100 ease-linear hover:bg-primary_hover"
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* ml-auto pushes the toggle to the far right of the header */}
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex flex-col gap-8 pt-8 pb-12">
                {/* Page title */}
                <div className="px-8 2xl:px-28">
                    <h1 className="text-xl font-semibold text-primary">Equipment list</h1>
                </div>

                <div className="flex flex-col gap-6 px-8 2xl:px-28">
                    {/* Filters bar: tabs on the left, search + filters on the right */}
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-1">
                            <ButtonGroup
                                size="sm"
                                selectionMode="single"
                                disallowEmptySelection
                                selectedKeys={[selectedFilter]}
                                onSelectionChange={(keys) => setSelectedFilter([...keys][0] as string)}
                            >
                                {filterTabs.map((tab) => (
                                    <ButtonGroupItem key={tab.id} id={tab.id}>
                                        {tab.label}
                                    </ButtonGroupItem>
                                ))}
                            </ButtonGroup>
                        </div>

                        <div className="flex items-center gap-3">
                            <Input
                                aria-label="Search equipments"
                                placeholder="Search"
                                icon={SearchLg}
                                size="sm"
                                className="w-70"
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                            <Button color="secondary" size="md" iconLeading={FilterLines} iconTrailing={ChevronDown}>
                                Filters
                            </Button>
                        </div>
                    </div>

                    {/* Equipment table */}
                    <TableCard.Root>
                        <Table aria-label="Equipment list">
                            <Table.Header>
                                <Table.Head id="id" label="ID" className={headStyles} />
                                <Table.Head id="company" label="Company" isRowHeader className={headStyles} />
                                <Table.Head id="designName" label="Design name" className={cx(headStyles, "w-full")} />
                                <Table.Head id="order" label="Order" className={headStyles} />
                                <Table.Head id="designId" label="Design ID" className={headStyles} />
                                <Table.Head id="machine" label="MachineMotion" className={headStyles} />
                                <Table.Head id="subscription" label="Subscription" className={headStyles} />
                                <Table.Head id="coverage" label="Coverage" className={headStyles} />
                                <Table.Head id="expiration" label="Expiration" className={headStyles} />
                                <Table.Head id="actions" className={headStyles} />
                            </Table.Header>

                            <Table.Body items={visibleEquipments}>
                                {(item) => (
                                    <Table.Row id={item.id}>
                                        <Table.Cell className={cx(cellStyles, "whitespace-nowrap")}>{item.id}</Table.Cell>
                                        <Table.Cell className={cx(cellStyles, "whitespace-nowrap font-medium text-primary")}>{item.company}</Table.Cell>
                                        <Table.Cell className={cx(cellStyles, "whitespace-nowrap font-medium text-primary")}>{item.designName}</Table.Cell>
                                        <Table.Cell className={cx(cellStyles, "whitespace-nowrap")}>{item.order}</Table.Cell>
                                        <Table.Cell className={cx(cellStyles, "whitespace-nowrap")}>{item.designId}</Table.Cell>
                                        <Table.Cell className={cellStyles}>
                                            <div className="flex items-center gap-1">
                                                <Badge type="modern" color="gray" size="sm">
                                                    {item.machine}
                                                </Badge>
                                                {item.extraMachines && (
                                                    <Badge type="modern" color="gray" size="sm">
                                                        +{item.extraMachines}
                                                    </Badge>
                                                )}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell className={cellStyles}>
                                            <Badge type="pill-color" color="gray" size="sm">
                                                {item.subscription}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell className={cellStyles}>
                                            <BadgeWithDot type="pill-color" color={coverageBadge[item.coverage].color} size="sm">
                                                {coverageBadge[item.coverage].label}
                                            </BadgeWithDot>
                                        </Table.Cell>
                                        <Table.Cell className={cx(cellStyles, "whitespace-nowrap")}>
                                            {item.expirationDate ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-primary">{item.expirationDate}</span>
                                                    <span className="text-tertiary">{item.expirationNote}</span>
                                                </div>
                                            ) : (
                                                <span className="text-tertiary">n/a</span>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell className={cellStyles}>
                                            <ButtonUtility
                                                size="xs"
                                                color="tertiary"
                                                icon={Edit01}
                                                tooltip="Edit"
                                                // Remember which row was clicked, then open the panel.
                                                // (onPress is React Aria's version of onClick — it also
                                                // handles keyboard and touch activation.)
                                                onPress={() => {
                                                    setSelectedEquipment(item);
                                                    setIsSlideoutOpen(true);
                                                }}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>

                        {/* Pagination footer: Previous | Page 1 of 10 | Next */}
                        <div className="flex items-center justify-between gap-3 border-t border-secondary px-5 pt-3 pb-4">
                            <Button color="secondary" size="sm">
                                Previous
                            </Button>
                            <span className="text-sm font-medium text-secondary">Page 1 of 10</span>
                            <Button color="secondary" size="sm">
                                Next
                            </Button>
                        </div>
                    </TableCard.Root>
                </div>
            </main>

            {/* Equipment detail slideout — opens when a row's pen button is clicked */}
            <EquipmentDetailSlideout equipment={selectedEquipment} isOpen={isSlideoutOpen} onOpenChange={setIsSlideoutOpen} />
        </div>
    );
}
