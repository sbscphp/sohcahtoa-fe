"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Group } from "@mantine/core";
import { Check } from "lucide-react";
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

export default function CreateBranchPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Basic Branch Information
  const [branchName, setBranchName] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [branchManager, setBranchManager] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Step 2: Add Agents
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentPhone, setAgentPhone] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCancel = () => {
    router.push(adminRoutes.adminOutlet());
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCreateBranchClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
  };

  const handleManageBranch = () => {
    setIsSuccessOpen(false);
    router.push(adminRoutes.adminOutlet());
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        {/* Progress Tracker - matches design */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between px-2">
            {/* Connecting line */}
            <div
              className={`absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 ${
                step === 2 ? "bg-orange-500" : "bg-gray-200"
              }`}
            />

            {/* Left step: Basic Branch Information */}
            <div className="relative z-10 flex flex-col items-start">
              {step === 2 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-orange-500 bg-white" />
              )}
            </div>

            {/* Right step: Add Agents */}
            <div className="relative z-10 flex flex-col items-end">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step === 2 ? "bg-orange-500" : "bg-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="mt-2 flex items-center justify-between px-1 text-xs font-medium">
            <span className="text-orange-500">Basic Branch Information</span>
            <span className={step === 2 ? "text-orange-500" : "text-gray-500"}>
              Add Agents
            </span>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="text-center mb-8">
              <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
                Fill in Branch Information
              </Text>
              <Text className="text-base! font-normal! text-gray-600!">
                Enter the necessary fields to create a new Sohcahtoa branch
              </Text>
            </div>

            <Stack gap="lg">
              <TextInput
                label="Branch Name"
                placeholder="e.g. Yaba"
                value={branchName}
                onChange={(e) => setBranchName(e.currentTarget.value)}
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
                  label="Branch Manager"
                  placeholder="e.g. Bashorun Dauda"
                  value={branchManager}
                  onChange={(e) => setBranchManager(e.currentTarget.value)}
                  required
                  radius="md"
                />
              </Group>

              <Group grow align="flex-start">
                <TextInput
                  label="Email Address"
                  placeholder="e.g. bashorun@sohcahtoa.com"
                  description="For manager"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.currentTarget.value)}
                  type="email"
                  required
                  radius="md"
                />
                <TextInput
                  label="Email Address"
                  placeholder="e.g. yababranch@sohcahtoa.com"
                  description="For branch"
                  value={branchEmail}
                  onChange={(e) => setBranchEmail(e.currentTarget.value)}
                  type="email"
                  required
                  radius="md"
                />
              </Group>

              <TextInput
                label="Address"
                placeholder="e.g. No 14, Unilag Rd, Yaba Lagos."
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                required
                radius="md"
              />

              <TextInput
                label="Phone Number"
                placeholder="e.g. +234 8138989206"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                required
                radius="md"
              />
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
                onClick={handleNext}
              >
                Next
              </CustomButton>
            </Group>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
                Add Agents to Branch
              </Text>
              <Text className="text-base! font-normal! text-gray-600!">
                Fill out the information to add an agent
              </Text>
            </div>

            <Stack gap="lg">
              <TextInput
                label="Agent Name"
                placeholder="e.g. Mallam Chibuzor"
                value={agentName}
                onChange={(e) => setAgentName(e.currentTarget.value)}
                required
                radius="md"
              />

              <Group grow align="flex-start">
                <TextInput
                  label="Email Address"
                  placeholder="e.g. chibuzor@sohcahtoa.com"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.currentTarget.value)}
                  type="email"
                  required
                  radius="md"
                />
                <TextInput
                  label="Phone Number"
                  placeholder="e.g. +234 8138989106"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.currentTarget.value)}
                  required
                  radius="md"
                />
              </Group>
            </Stack>

            <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
              <CustomButton
                fullWidth
                size="md"
                buttonType="secondary"
                onClick={handleBack}
              >
                Back
              </CustomButton>
              <CustomButton
                fullWidth
                size="md"
                buttonType="primary"
                onClick={handleCreateBranchClick}
              >
                Create Branch
              </CustomButton>
            </Group>
          </>
        )}
      </div>

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Create a Branch ?"
        message="Are you sure you want to create this Branch? An invite will be sent to the branch email, branch manager and agents added."
        primaryButtonText="Yes, Create"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmCreate}
        onSecondary={() => setIsConfirmOpen(false)}
        loading={isSaving}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Branch Created"
        message="Branch successfully created. Agents can now be added to branches."
        primaryButtonText="Manage Branch"
        onPrimaryClick={handleManageBranch}
      />
    </div>
  );
}
