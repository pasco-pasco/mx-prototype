"use client";

// Equipment detail slideout — replicated from the Figma mockup (node 225:35182).
// It slides in from the right when the user clicks the pen (Edit) button on a
// table row, and shows that row's data inside form fields.

import { Calendar, ChevronDown, LinkBroken01, Plus } from "@untitledui/icons";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// The slice of an equipment row that the slideout needs. The page's own
// `Equipment` objects have all of these fields, so a row can be passed
// straight in (like a Figma instance swap — same properties, new values).
export interface EquipmentDetail {
    company: string;
    designName: string;
    order: string;
    designId: string;
    machine: string;
    extraMachines?: number;
    subscription: string;
    coverage: "active" | "expiring" | "expired" | "none";
    expirationDate?: string;
    expirationNote?: string;
}

interface EquipmentDetailSlideoutProps {
    // The row that was clicked (null before the first click).
    equipment: EquipmentDetail | null;
    // Whether the panel is currently visible.
    isOpen: boolean;
    // Called by the component when it wants to close (X button, Esc key,
    // or clicking the dark overlay).
    onOpenChange: (isOpen: boolean) => void;
}

// Same coverage → badge color mapping as the table, so the pill in the
// subscription card always matches the pill in the row.
const coverageBadge: Record<EquipmentDetail["coverage"], { color: "success" | "warning" | "error" | "gray"; label: string }> = {
    active: { color: "success", label: "Active" },
    expiring: { color: "warning", label: "Expiring" },
    expired: { color: "error", label: "Expired" },
    none: { color: "gray", label: "None" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const EquipmentDetailSlideout = ({ equipment, isOpen, onOpenChange }: EquipmentDetailSlideoutProps) => {
    if (!equipment) return null;

    // Total number of machines on this equipment: the main serial + any "+N" extras.
    const machineCount = 1 + (equipment.extraMachines ?? 0);

    // Builds the label above the date field, e.g. "Expires in 190 days".
    // When the row is already expired the note is just "Expired".
    const expiresLabel = equipment.expirationNote?.startsWith("in") ? `Expires ${equipment.expirationNote}` : (equipment.expirationNote ?? "Expiration date");

    // Turns "2027-05-01" into the "2027 / 05 / 01" format shown in the mockup.
    const formattedDate = equipment.expirationDate?.replaceAll("-", " / ");

    const hasSubscription = equipment.subscription !== "None";

    // isDismissable lets the user close the panel by clicking the dark overlay.
    return (
        <SlideoutMenu isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
            {({ close }) => (
                <>
                    {/* Panel header: title + the X close button (built into the header) */}
                    <SlideoutMenu.Header onClose={close}>
                        <h2 className="text-lg font-semibold text-primary">Equipment details</h2>
                    </SlideoutMenu.Header>

                    <SlideoutMenu.Content className="pb-6">
                        {/* --- Top group: the three identity fields ------------------ */}
                        <div className="flex flex-col gap-3">
                            <Input size="sm" label="Nickname" defaultValue={equipment.designName} />
                            {/* Company ID isn't in the table data yet, so this uses the
                                sample value from the mockup for now. */}
                            <Input size="sm" label="Company ID" defaultValue="82672" />
                            <Input size="sm" label="Design ID" defaultValue={equipment.designId} />
                        </div>

                        <hr className="border-t border-secondary" />

                        {/* --- Master MachineMotion section --------------------------- */}
                        <div className="flex flex-col gap-4">
                            <Select
                                size="sm"
                                label="Master MachineMotion"
                                defaultSelectedKey={equipment.machine}
                                items={[{ id: equipment.machine, label: equipment.machine }]}
                            >
                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                            </Select>

                            <div className="flex">
                                <Button color="link-gray" size="sm" iconTrailing={ChevronDown}>
                                    Modify serial number ({machineCount})
                                </Button>
                            </div>

                            <div className="flex">
                                <Button color="link-color" size="sm" iconLeading={Plus}>
                                    Add machine
                                </Button>
                            </div>
                        </div>

                        <hr className="border-t border-secondary" />

                        {/* --- Subscription section ----------------------------------- */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-primary">Subscription</h3>

                            {/* The subscription card only shows when the row actually has
                                a plan; rows with "None" just get the link button below. */}
                            {hasSubscription && (
                                <div className="flex w-full flex-col rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
                                    {/* Card header: plan name, order number, status pill */}
                                    <div className="flex items-center gap-1 border-b border-secondary py-3 pr-5 pl-4">
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <p className="text-sm font-semibold text-secondary">{equipment.subscription} · 2-year plan</p>
                                            <p className="truncate text-sm text-tertiary">Order #{equipment.order}</p>
                                        </div>
                                        <BadgeWithDot type="pill-color" color={coverageBadge[equipment.coverage].color} size="sm">
                                            {coverageBadge[equipment.coverage].label}
                                        </BadgeWithDot>
                                    </div>

                                    {/* Card body: expiry date, reassign select, unlink action */}
                                    <div className="flex flex-col gap-4 p-4">
                                        <Input size="sm" label={expiresLabel} icon={Calendar} defaultValue={formattedDate} />

                                        <Select
                                            size="sm"
                                            label="Reassign subscription"
                                            tooltip="Move this subscription to another machine on this equipment."
                                            placeholder="Select"
                                            items={[{ id: equipment.machine, label: equipment.machine }]}
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>

                                        <div className="flex">
                                            <Button color="link-gray" size="sm" iconLeading={LinkBroken01}>
                                                Unlink subscription
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex">
                                <Button color="link-color" size="sm" iconLeading={Plus}>
                                    Link subscription
                                </Button>
                            </div>
                        </div>
                    </SlideoutMenu.Content>
                </>
            )}
        </SlideoutMenu>
    );
};
