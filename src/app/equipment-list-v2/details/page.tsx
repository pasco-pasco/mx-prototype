"use client";

// Equipment details page — opened by the pen button on the equipment list v2
// table. Layout follows the Figma design (Equipment-list / node 250-5584),
// which borrows from Untitled UI's "Settings 05" page template and the
// radio-group card components. Everything is assembled from Untitled UI
// components that already live in src/components/.

import { useEffect, useRef, useState } from "react";
import type { FC } from "react";
import { createPortal } from "react-dom";
import { Check, DotsVertical, Edit01, LayersThree01, LayersTwo01, LinkBroken01, Lock01, Moon01, Plus, Sun, Zap } from "@untitledui/icons";
import { useTheme } from "next-themes";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

// The equipment shown on this page. In the real app this would come from the
// row the user clicked; for the prototype it's the hard-coded values from the
// Figma mockup.
const equipment = {
    designName: "3330mm 7th axis with robot",
    organizationName: "Utility Global",
    companyId: "8672",
    designId: "44821",
    masterController: "MM2-2024-00455",
    controllers: ["MM2-2024-00458", "MM2-2024-00455", "MM2-2024-00450", "MM2-2024-00230", "MM2-2024-00102"],
};

// One entry per subscription card. `assignedTo` drives the badge in the card
// header: a design ID shows the "✓ Assigned to ID …" badge, and `null` shows
// the plain "Not assigned" badge (like a boolean variant in Figma).
interface Subscription {
    id: string;
    name: string;
    planLength: string;
    icon: FC<{ className?: string }>;
    assignedTo: string | null;
    orderNumber: string;
    expirationDate: string;
    expirationNote: string;
}

// The one subscription currently linked to this equipment (selected card).
const currentSubscription: Subscription = {
    id: "monitor",
    name: "Monitor plan",
    planLength: "1 years plan",
    icon: LayersTwo01,
    assignedTo: "44821",
    orderNumber: "973729",
    expirationDate: "04/16/2028",
    expirationNote: "In 190 days",
};

// Subscriptions the organization owns but hasn't linked to this equipment.
const availableSubscriptions: Subscription[] = [
    {
        id: "diagnose",
        name: "Diagnose",
        planLength: "1 years plan",
        icon: LayersThree01,
        assignedTo: "8251",
        orderNumber: "973729",
        expirationDate: "04/16/2028",
        expirationNote: "In 190 days",
    },
    {
        id: "priority-care",
        name: "Priority Care",
        planLength: "1 years plan",
        icon: Zap,
        assignedTo: null,
        orderNumber: "973729",
        expirationDate: "04/16/2028",
        expirationNote: "In 190 days",
    },
];

// Options for the "Assign subscription" dropdown inside each card.
const assignOptions = [
    { id: "44821", label: "ID 44821 — 3330mm 7th axis with robot" },
    { id: "8251", label: "ID 8251 — Ceramic spraying system" },
];

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

const navItems = ["Sales tools", "Ressources", "Parts", "Designs", "Organizations", "Admin"];

// Same theme toggle as the equipment list page: moon in light mode,
// sun in dark mode.
function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    // Wait until mounted in the browser before showing the real icon, so the
    // server-rendered HTML and the browser HTML don't disagree.
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

// Section header used across the page: a title, supporting text, an optional
// "…" menu button on the right, and a divider underneath. Matches the
// Untitled UI "Section header" component from the Figma file.
function SectionHeader({ title, supportingText, showMenu = true }: { title: string; supportingText: string; showMenu?: boolean }) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
                <div className="flex flex-1 flex-col gap-0.5">
                    <h2 className="text-md font-semibold text-primary">{title}</h2>
                    <p className="text-sm text-tertiary">{supportingText}</p>
                </div>
                {showMenu && <ButtonUtility size="sm" color="tertiary" icon={DotsVertical} tooltip="More options" />}
            </div>
            <div className="h-px w-full bg-border-secondary" />
        </div>
    );
}

// Three-dot menu on the current subscription card. Opens a dropdown with the
// destructive "Unlink subscription" action from Figma (node 260-3888).
//
// Portaled to document.body (same pattern as table tooltips) because React Aria
// MenuTrigger does not reliably open on this page after SSR/hydration.
function SubscriptionCardMenu() {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

    const openMenu = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) {
            // Align menu to the right edge of the trigger (216px = w-54).
            setPosition({ top: rect.bottom + 4, left: rect.right - 216 });
        }
        setIsOpen(true);
    };

    // Close when clicking outside or pressing Escape.
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
            setIsOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
                onPointerDown={(event) => event.stopPropagation()}
                className="group relative inline-flex h-max cursor-pointer items-center justify-center rounded-md p-1.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
            >
                <DotsVertical data-icon className="size-5 transition-inherit-all" aria-hidden="true" />
            </button>

            {isMounted &&
                isOpen &&
                createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        className="fixed z-[100] w-54 rounded-lg bg-primary py-1 shadow-lg ring-1 ring-secondary_alt"
                        style={{ top: position.top, left: position.left }}
                    >
                        <button
                            type="button"
                            role="menuitem"
                            className="group mx-1.5 flex w-[calc(100%-12px)] cursor-pointer items-center rounded-md px-2.5 py-2 text-left outline-hidden transition duration-100 ease-linear hover:bg-primary_hover focus-visible:bg-primary_hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
                            onClick={() => setIsOpen(false)}
                        >
                            <LinkBroken01 aria-hidden="true" className="mr-2 size-4 shrink-0 stroke-[2.25px] text-fg-error-primary" />
                            <span className="truncate text-sm font-semibold text-error-primary">Unlink subscription</span>
                        </button>
                    </div>,
                    document.body,
                )}
        </>
    );
}

// One subscription card, modelled on the Untitled UI radio-group "icon card":
// a header row (featured icon + plan name + assignment badge + menu) and a
// body with the order number, expiration, and assign dropdown.
// `isSelected` renders the brand-colored border, like the checked state of a
// radio card in Figma.
function SubscriptionCard({ subscription, isSelected = false }: { subscription: Subscription; isSelected?: boolean }) {
    const SubscriptionIcon = subscription.icon;

    return (
        <div
            className={cx(
                "flex flex-col rounded-xl bg-primary transition duration-100 ease-linear",
                // Selected = thick brand border + subtle tinted background.
                // Unselected = regular 1px border.
                isSelected ? "bg-secondary_subtle ring-2 ring-brand ring-inset" : "ring-1 ring-secondary ring-inset",
            )}
        >
            {/* Card header */}
            <div className="flex items-center gap-4 border-b border-secondary py-3 pr-5 pl-3">
                <div className="flex flex-1 items-center gap-3">
                    {/* The squared icon container ("modern" featured icon style) */}
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset">
                        <SubscriptionIcon className="size-5 text-fg-secondary" aria-hidden="true" />
                    </span>
                    <p className="text-lg font-semibold text-secondary">
                        {subscription.name} · {subscription.planLength}
                    </p>
                </div>

                {/* Assignment badge: check + ID when assigned, plain gray otherwise */}
                {subscription.assignedTo ? (
                    <BadgeWithIcon type="modern" color="gray" size="md" iconLeading={Check}>
                        Assigned to ID {subscription.assignedTo}
                    </BadgeWithIcon>
                ) : (
                    <Badge type="modern" color="gray" size="md">
                        Not assigned
                    </Badge>
                )}

                {isSelected ? (
                    <SubscriptionCardMenu />
                ) : (
                    <ButtonUtility size="sm" color="tertiary" icon={DotsVertical} tooltip="More options" />
                )}
            </div>

            {/* Card body: three equal columns */}
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
                {/* Order number, with a "#" add-on box in front (InputGroup).
                    The value lives on the InputGroup (the field wrapper), not
                    on the inner InputBase. */}
                <div className="flex-1">
                    <InputGroup label="Order number" defaultValue={subscription.orderNumber} leadingAddon={<InputGroup.Prefix>#</InputGroup.Prefix>}>
                        <InputBase />
                    </InputGroup>
                </div>

                {/* Expiration: shown read-only as "date – time remaining" */}
                <div className="flex-1">
                    <Input label="Expiration" isReadOnly value={`${subscription.expirationDate} – ${subscription.expirationNote}`} />
                </div>

                {/* Assign subscription dropdown, with a help tooltip on the label */}
                <div className="flex-1">
                    <Select
                        label="Assign subscription"
                        tooltip="Link this subscription to a design ID."
                        placeholder="Select"
                        items={assignOptions}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EquipmentDetailsPage() {
    return (
        <div className="flex min-h-dvh flex-col bg-primary">
            {/* Header navigation — identical to the equipment list page */}
            <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-secondary bg-primary">
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

                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex flex-col gap-8 pt-8 pb-12">
                {/* Page title: "Equipments list / <design name>". The first part
                    links back to the table, like a breadcrumb. */}
                <div className="flex flex-col gap-4 px-8 2xl:px-28">
                    <h1 className="text-xl font-semibold text-primary">
                        <a href="/equipment-list-v2" className="transition duration-100 ease-linear hover:text-secondary hover:underline">
                            Equipments list
                        </a>{" "}
                        / {equipment.designName}
                    </h1>
                    <div className="h-px w-full bg-border-secondary" />
                </div>

                {/* Two-column layout: equipment info on the left,
                    subscriptions on the right (stacks on smaller screens). */}
                <div className="grid grid-cols-1 gap-16 px-8 xl:grid-cols-[2fr_3fr] 2xl:px-28">
                    {/* ---------------- Left column ---------------- */}
                    <div className="flex flex-col gap-16">
                        {/* Equipment details */}
                        <section className="flex flex-col gap-6">
                            <SectionHeader title="Equipment details" supportingText="Which organization and design this equipment belongs to." />

                            <div className="flex flex-col gap-5">
                                {/* The lock icon + disabled state mark these two
                                    fields as read-only (owned by the organization). */}
                                <Input label="Organization name" icon={Lock01} isDisabled value={equipment.organizationName} />
                                <Input label="Company ID" icon={Lock01} isDisabled value={equipment.companyId} />
                                <Input label="Design ID" defaultValue={equipment.designId} />
                            </div>
                        </section>

                        {/* MachineMotions */}
                        <section className="flex flex-col gap-6">
                            <SectionHeader title="MachineMotions" supportingText="One MachineMotion controller is set as the master." />

                            {/* Master controller picker */}
                            <Select
                                label="Master"
                                items={equipment.controllers.map((serial) => ({ id: serial, label: serial }))}
                                defaultSelectedKey={equipment.masterController}
                            >
                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                            </Select>

                            {/* All controllers on this equipment, with an edit
                                button in the top-right corner of the card. */}
                            <div className="relative rounded-lg bg-secondary p-3 ring-1 ring-secondary ring-inset">
                                <ul className="flex flex-col gap-2">
                                    {equipment.controllers.map((serial) => (
                                        <li key={serial} className="text-md text-tertiary">
                                            {serial}
                                        </li>
                                    ))}
                                </ul>
                                <ButtonUtility size="sm" color="tertiary" icon={Edit01} tooltip="Edit controllers" className="absolute top-3 right-3" />
                            </div>

                            <div>
                                <Button color="secondary" size="sm" iconLeading={Plus}>
                                    Add controller
                                </Button>
                            </div>
                        </section>
                    </div>

                    {/* ---------------- Right column ---------------- */}
                    <div className="flex flex-col gap-16">
                        {/* Current subscriptions */}
                        <section className="flex flex-col gap-6">
                            <SectionHeader title="Current subscriptions" supportingText="Subscriptions linked to this equipment right now." />
                            <SubscriptionCard subscription={currentSubscription} isSelected />
                        </section>

                        {/* Available to link */}
                        <section className="flex flex-col gap-6">
                            <SectionHeader
                                title="Available to link"
                                supportingText="Subscriptions this organization has bought that aren't linked to this equipment."
                                showMenu={false}
                            />
                            <div className="flex flex-col gap-6">
                                {availableSubscriptions.map((subscription) => (
                                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
