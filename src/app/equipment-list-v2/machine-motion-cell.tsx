"use client";

// MachineMotion table cell — master controller as plain text, "+N" as a grey pill badge.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/base/badges/badges";

interface MachineMotionCellProps {
    /** Primary controller serial shown as table text. */
    machine: string;
    /** Additional controller serials revealed in the "+N" badge tooltip. */
    extraMachineSerials?: string[];
}

// Hover tooltip for the "+N" pill. Portaled to document.body so it is not
// clipped by the table card's overflow-hidden.
function ExtraMachinesBadge({ serials }: { serials: string[] }) {
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

    const openTooltip = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) {
            setPosition({ x: rect.left + rect.width / 2, y: rect.top });
        }
        setIsOpen(true);
    };

    return (
        <>
            <span
                ref={triggerRef}
                className="inline-flex cursor-default"
                onMouseEnter={openTooltip}
                onMouseLeave={() => setIsOpen(false)}
                onFocus={openTooltip}
                onBlur={() => setIsOpen(false)}
                onPointerDown={(event) => event.stopPropagation()}
            >
                <Badge type="pill-color" color="gray" size="sm">
                    +{serials.length}
                </Badge>
            </span>

            {isMounted &&
                isOpen &&
                createPortal(
                    <div
                        role="tooltip"
                        className="pointer-events-none fixed z-[100] flex max-w-xs -translate-x-1/2 -translate-y-[calc(100%+6px)] flex-col gap-1 rounded-lg bg-primary-solid px-3 py-2 shadow-lg"
                        style={{ left: position.x, top: position.y }}
                    >
                        {serials.map((serial) => (
                            <span key={serial} className="whitespace-nowrap text-xs font-normal text-white">
                                {serial}
                            </span>
                        ))}
                    </div>,
                    document.body,
                )}
        </>
    );
}

export function MachineMotionCell({ machine, extraMachineSerials }: MachineMotionCellProps) {
    return (
        <div className="flex items-center gap-1">
            <span className="whitespace-nowrap text-secondary">{machine}</span>
            {extraMachineSerials && extraMachineSerials.length > 0 && <ExtraMachinesBadge serials={extraMachineSerials} />}
        </div>
    );
}
