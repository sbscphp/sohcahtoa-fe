"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Stack,
    Text,
    TextInput,
    Textarea,
    Group,
    ActionIcon,
    Divider,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { TimeInput } from "@mantine/dates";
import { Calendar, Clock, ArrowLeftRight } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import CurrencySelector from "@/app/admin/_components/CurrencySelector";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { cbnLogo } from "@/app/assets/asset";
import Image from "next/image";

const SECTION_TITLE_CLASS = "text-lg! font-semibold! text-orange-500!";
const SECTION_DESC_CLASS = "text-base! text-body-text-100! mb-4!";

const MAX_JUSTIFICATION_WORDS = 32;

export default function RateDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const rateId = params?.id;

    const [buyCurrency, setBuyCurrency] = useState<string | null>("USD");
    const [buyValue, setBuyValue] = useState("1450");

    const [sellCurrency, setSellCurrency] = useState<string | null>("USD");
    const [sellValue, setSellValue] = useState("1750");

    const [startDate, setStartDate] = useState<string | null>(null);
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState<string | null>(null);
    const [endTime, setEndTime] = useState("");

    const [justificationNote, setJustificationNote] = useState("");
    const justificationWordCount = justificationNote.trim()
        ? justificationNote.trim().split(/\s+/).length
        : 0;
    const justificationOverLimit = justificationWordCount > MAX_JUSTIFICATION_WORDS;

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSwapConversion = () => {
        setBuyCurrency(sellCurrency);
        setSellCurrency(buyCurrency);
        setBuyValue(sellValue);
        setSellValue(buyValue);
    };

    const handleJustificationChange = (value: string) => {
        setJustificationNote(value);
    };

    const handleCancel = () => {
        router.push("/admin/rate");
    };

    const handleSaveClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmUpdate = () => {
        if (!rateId) return;
        setIsSaving(true);
        // TODO: Submit update to API (e.g. PATCH /rate/:id) – on success:
        setTimeout(() => {
            setIsSaving(false);
            setIsConfirmOpen(false);
            setIsSuccessOpen(true);
        }, 500);
    };

    const handleSuccessManageRate = () => {
        setIsSuccessOpen(false);
        router.push("/admin/rate");
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
                {/* Main Setting */}
                <section className="mb-8">
                    <Text className={SECTION_TITLE_CLASS} mb={4}>
                        Main Setting
                    </Text>
                    <Text className={SECTION_DESC_CLASS}>
                        Setup the buy and selling rate for this specific currency
                    </Text>

                    <Stack gap="lg" mt="xl">
                        {/* Exchange: BUY */}
                        <div className="p-4 rounded-xl! bg-gray-25">
                            <Text size="sm" fw={500} mb={6} className="text-body-text-100!">
                                Exchange: <span className="font-bold!">BUY</span> <span className="text-red-500">*</span>
                            </Text>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <CurrencySelector />
                                <TextInput
                                    placeholder="$ Enter Value"
                                    value={buyValue}
                                    onChange={(e) => setBuyValue(e.currentTarget.value)}
                                    radius="md"
                                    className="flex-1 min-w-[140px]"
                                    classNames={{
                                        input: "text-xl! font-bold! text-start!",
                                    }}
                                    styles={{
                                        input: {
                                            background: "transparent",
                                            border: "none",
                                            boxShadow: "none",
                                            padding: 0,
                                            height: "fit-content",
                                        },
                                    }}
                                />
                                <ActionIcon
                                    className="h-15! w-15! rounded-full!"
                                    variant="filled"
                                    color="dark"
                                    onClick={handleSwapConversion}
                                    aria-label="Swap conversion"
                                >
                                    <div className="flex items-center rounded-md justify-center bg-[#6d6b6e] h-5 w-5">
                                        <ArrowLeftRight size={16} />
                                    </div>
                                </ActionIcon>
                                <TextInput
                                    placeholder="Naira (₦) Equivalent"
                                    value={buyValue}
                                    onChange={(e) => setBuyValue(e.currentTarget.value)}
                                    radius="md"
                                    className="flex-1 min-w-[140px]"
                                    classNames={{
                                        input: "text-xl! font-bold! text-end!",
                                    }}
                                    styles={{
                                        input: {
                                            background: "transparent",
                                            border: "none",
                                            boxShadow: "none",
                                            padding: 0,
                                            height: "fit-content",
                                        },
                                    }}
                                />
                            </div>
                        </div>
                        {/* CBN Rate info – below Exchange: BUY */}
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl! bg-primary-0 border border-primary-400 p-4">
                            <div className="flex items-center gap-3">
                                <Image src={cbnLogo} alt="CBN" width={48} height={48} className="shrink-0" />
                                <div>
                                    <p className="text-primary-400 font-bold">API: CBN Rate (€)</p>
                                    <p className="italic text-body-text-100">
                                        <span className="text-pink-600">Kindly note:</span>{" "}
                                        Your buy rate can exceed 2.0% of CBN recommended rate
                                    </p>
                                </div>
                            </div>
                            <p className="shrink-0 text-right text-xl font-bold text-heading-300">1 $ = ₦1,800</p>
                        </div>

                        {/* Exchange: SELL */}
                        <div className="p-4 rounded-xl! bg-gray-25">
                            <Text size="sm" fw={500} mb={6} className="text-body-text-100!">
                                Exchange: <span className="font-bold!">SELL</span>
                            </Text>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <CurrencySelector />
                                <TextInput
                                    placeholder="$ Enter Value"
                                    value={sellValue}
                                    onChange={(e) => setSellValue(e.currentTarget.value)}
                                    radius="md"
                                    className="flex-1 min-w-[140px]"
                                    classNames={{
                                        input: "text-xl! font-bold! text-start!",
                                    }}
                                    styles={{
                                        input: {
                                            background: "transparent",
                                            border: "none",
                                            boxShadow: "none",
                                            padding: 0,
                                            height: "fit-content",
                                        },
                                    }}
                                />
                                <ActionIcon
                                    className="h-15! w-15! rounded-full!"
                                    variant="filled"
                                    color="dark"
                                    onClick={handleSwapConversion}
                                    aria-label="Swap conversion"
                                >
                                    <div className="flex items-center rounded-md justify-center bg-[#6d6b6e] h-5 w-5">
                                        <ArrowLeftRight size={16} />
                                    </div>
                                </ActionIcon>
                                <TextInput
                                    placeholder="Naira (₦) Equivalent"
                                    value={sellValue}
                                    onChange={(e) => setSellValue(e.currentTarget.value)}
                                    radius="md"
                                    className="flex-1 min-w-[140px]"
                                    classNames={{
                                        input: "text-xl! font-bold! text-end!",
                                    }}
                                    styles={{
                                        input: {
                                            background: "transparent",
                                            border: "none",
                                            boxShadow: "none",
                                            padding: 0,
                                            height: "fit-content",
                                        },
                                    }}
                                />
                            </div>
                        </div>
                        {/* CBN Rate info – below Exchange: SELL */}
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-primary-0 border border-primary-400 p-4">
                            <div className="flex items-center gap-3">
                                <Image src={cbnLogo} alt="CBN" width={48} height={48} className="shrink-0" />
                                <div>
                                    <p className="text-primary-400 font-bold">API: CBN Rate (€)</p>
                                    <p className="italic text-body-text-100">
                                        <span className="text-pink-600">Kindly note:</span>{" "}
                                        Your buy rate can exceed 2.0% of CBN recommended rate
                                    </p>
                                </div>
                            </div>
                            <p className="shrink-0 text-right text-xl font-bold text-heading-300">1 $ = ₦1,800</p>
                        </div>
                    </Stack>
                </section>

                <Divider my="xl" />

                {/* Other Setting */}
                <section className="mb-8">
                    <Text className={SECTION_TITLE_CLASS} mb={4}>
                        Other Setting
                    </Text>
                    <Text className={SECTION_DESC_CLASS}>
                        Other important currency setting that impact transaction and FX exchange
                    </Text>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8!">
                        <Stack gap="md">
                            <div>
                                <DatePickerInput
                                    label="Effective Start Date"
                                    required
                                    placeholder="Enter Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    radius="md"
                                    rightSection={<Calendar size={16} />}
                                />
                                <Text size="xs" c="dimmed" mt={6}>
                                    When this rate goes live, it will affect foreign exchange transactions on the system
                                </Text>
                            </div>
                            <div>
                                <TimeInput
                                    label="Effective Start Time"
                                    required
                                    placeholder="Hour:Minutes:Seconds AM"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.currentTarget.value)}
                                    radius="md"
                                    rightSection={<Clock size={16} />}
                                />
                                <Text size="xs" c="dimmed" mt={6}>
                                    From the stated start time, this rate will apply to all foreign exchange transactions on the system
                                </Text>
                            </div>
                        </Stack>

                        <Stack gap="md">
                            <div>
                                <DatePickerInput
                                    label="Effective End Date"
                                    required
                                    placeholder="Enter End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    radius="md"
                                    rightSection={<Calendar size={16} />}
                                />
                                <Text size="xs" c="dimmed" mt={6}>
                                    When this rate ends, it will no longer apply to foreign exchange transactions on the system.
                                </Text>
                            </div>
                            <div>
                                <TimeInput
                                    label="Effective End Time"
                                    required
                                    placeholder="Hour:Minutes:Seconds AM"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.currentTarget.value)}
                                    radius="md"
                                    rightSection={<Clock size={16} />}
                                />
                                <Text size="xs" c="dimmed" mt={6}>
                                    After the stated end time, this rate will no longer apply to foreign exchange transactions on the system.
                                </Text>
                            </div>
                        </Stack>
                    </div>
                </section>

                <Divider my="xl" />

                {/* Note */}
                <section className="mb-8">
                    <Text className={SECTION_TITLE_CLASS} mb={4}>
                        Note
                    </Text>
                    <Text className={SECTION_DESC_CLASS}>
                        For documentation and approval processes
                    </Text>

                    <div>
                        <Textarea
                            label="Justification Note"
                            required
                            placeholder="Start Typing"
                            value={justificationNote}
                            onChange={(e) => handleJustificationChange(e.currentTarget.value)}
                            minRows={4}
                            radius="md"
                            error={justificationOverLimit ? `Not more than ${MAX_JUSTIFICATION_WORDS} words count` : undefined}
                        />
                        <Text
                            size="xs"
                            c={justificationOverLimit ? "red" : "dimmed"}
                            mt={6}
                        >
                            Not more than {MAX_JUSTIFICATION_WORDS} words count
                            {justificationNote.trim() && (
                                <span className="ml-1">
                                    ({justificationWordCount}/{MAX_JUSTIFICATION_WORDS})
                                </span>
                            )}
                        </Text>
                    </div>
                </section>

                {/* Action Buttons */}
                <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
                    <CustomButton fullWidth size="lg" buttonType="secondary" onClick={handleCancel}>
                        Cancel
                    </CustomButton>
                    <CustomButton fullWidth size="lg" buttonType="primary" onClick={handleSaveClick}>
                        Save
                    </CustomButton>
                </Group>
            </div>

            {/* Confirmation modal before saving changes */}
            <ConfirmationModal
                opened={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Save Changes ?"
                message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
                primaryButtonText="Yes, Save and Update Changes"
                secondaryButtonText="No, Close"
                onPrimary={handleConfirmUpdate}
                onSecondary={() => setIsConfirmOpen(false)}
                loading={isSaving}
            />

            {/* Success modal after changes are saved */}
            <SuccessModal
                opened={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="New Changes Saved"
                message="New Changes has been successfully Saved and Updated"
                primaryButtonText="Manage Rate"
                onPrimaryClick={handleSuccessManageRate}
                secondaryButtonText="No, Close"
                onSecondaryClick={() => setIsSuccessOpen(false)}
            />
        </div>
    );
}
