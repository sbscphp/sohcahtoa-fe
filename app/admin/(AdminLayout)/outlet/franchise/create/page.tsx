"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Group } from "@mantine/core";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";

const NIGERIAN_STATES = [
    { value: "Lagos", label: "Lagos" },
    { value: "Abuja", label: "Abuja" },
    { value: "Kano", label: "Kano" },
    { value: "Rivers", label: "Rivers" },
    { value: "Oyo", label: "Oyo" },
    { value: "Enugu", label: "Enugu" },
    { value: "Kaduna", label: "Kaduna" },
    { value: "Delta", label: "Delta" },
    { value: "Ogun", label: "Ogun" },
    { value: "Anambra", label: "Anambra" },
];

export default function CreateFranchisePage() {
    const router = useRouter();

    const [franchiseName, setFranchiseName] = useState("");
    const [state, setState] = useState<string | null>(null);
    const [address, setAddress] = useState("");
    const [contactPersonName, setContactPersonName] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [phoneNumber1, setPhoneNumber1] = useState("");
    const [phoneNumber2, setPhoneNumber2] = useState("");

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleCancel = () => {
        router.push(adminRoutes.adminOutlet());
    };

    const handleCreateFranchiseClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmCreate = async () => {
        setIsSaving(true);
        // TODO: Submit to API – on success:
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSaving(false);
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
    };

    const handleManageFranchise = () => {
        setIsSuccessOpen(false);
        router.push(adminRoutes.adminOutlet());
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">

                <div className="text-center mb-8">
                    <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
                        Fill in Required Information
                    </Text>
                    <Text className="text-base! font-normal! text-gray-600!">
                        Enter the necessary fields to create a new franchise
                    </Text>
                </div>

                <Stack gap="lg">
                    <TextInput
                        label="Franchise Name"
                        placeholder="e.g. Sterling Exchange"
                        value={franchiseName}
                        onChange={(e) => setFranchiseName(e.currentTarget.value)}
                        required
                        radius="md"
                    />

                    <Group grow align="flex-start">
                        <Select
                            label="State"
                            placeholder="Select state"
                            data={NIGERIAN_STATES}
                            value={state}
                            onChange={setState}
                            required
                            radius="md"
                        />
                        <TextInput
                            label="Address"
                            placeholder="Enter address"
                            value={address}
                            onChange={(e) => setAddress(e.currentTarget.value)}
                            required
                            radius="md"
                        />
                    </Group>

                    <TextInput
                        label="Contact Person Name"
                        placeholder="e.g. Adekunle, Ibrahim Olamide"
                        value={contactPersonName}
                        onChange={(e) => setContactPersonName(e.currentTarget.value)}
                        required
                        radius="md"
                    />

                    <TextInput
                        label="Email Address"
                        placeholder="e.g. olamide@sohcahtoa.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.currentTarget.value)}
                        type="email"
                        required
                        radius="md"
                    />

                    <Group grow align="flex-start">
                        <TextInput
                            label="Phone Number 1"
                            placeholder="+234 90 4747 2791"
                            value={phoneNumber1}
                            onChange={(e) => setPhoneNumber1(e.currentTarget.value)}
                            required
                            radius="md"
                        />
                        <TextInput
                            label="Phone Number 2 (optional)"
                            placeholder="+234 00 0000 0000"
                            value={phoneNumber2}
                            onChange={(e) => setPhoneNumber2(e.currentTarget.value)}
                            radius="md"
                        />
                    </Group>
                </Stack>

                <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
                    <CustomButton
                        fullWidth
                        size="md"
                        buttonType="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </CustomButton>
                    <CustomButton
                        fullWidth
                        size="md"
                        buttonType="primary"
                        onClick={handleCreateFranchiseClick}
                    >
                        Create Franchise
                    </CustomButton>
                </Group>
            </div>

            <ConfirmationModal
                opened={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Create a Franchise ?"
                message="Are you sure you want to create this franchise? An invite will be sent to the email address."
                primaryButtonText="Yes, Create"
                secondaryButtonText="No, Close"
                onPrimary={handleConfirmCreate}
                onSecondary={() => setIsConfirmOpen(false)}
                loading={isSaving}
            />

            <SuccessModal
                opened={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="Franchise Created"
                message="Franchise successfully created. An email for onboarding will be sent to the franchise created."
                primaryButtonText="Manage Franchise"
                onPrimaryClick={handleManageFranchise}
            />
        </div>
    );
}
