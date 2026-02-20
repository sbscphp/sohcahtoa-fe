"use client";

import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { UserTypeCard } from "@/app/(customer)/_components/auth/UserTypeCard";
import { citizenIcon, expatriateIcon, touristIcon } from "@/app/assets/asset";
import { Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getNextStep, clearOnboardingSessionStorage } from "../../_utils/auth-flow";

type UserType = "citizen" | "tourist" | "expatriate" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleContinue = () => {
    if (selectedType) {
      const storedUserType = sessionStorage.getItem("userType");
      if (storedUserType && storedUserType !== selectedType) {
        clearOnboardingSessionStorage();
      }
      sessionStorage.setItem("userType", selectedType);
      router.push(getNextStep(selectedType, "onboarding"));
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Welcome to SOHCAHTOA,
          </h1>
          <p className="text-body-text-100 text-base">
            Join us to easily buy, sell, or receive foreign exchange all in a
            few simple steps.
          </p>
        </div>

        <div className="space-y-4">
          <UserTypeCard
            icon={citizenIcon}
            title="Citizen"
            description="A Nigerian resident applying for FX"
            isSelected={selectedType === "citizen"}
            onClick={() => setSelectedType("citizen")}
          />

          <UserTypeCard
            icon={touristIcon}
            title="Tourist"
            description="I'm visiting Nigeria and need FX during my stay"
            isSelected={selectedType === "tourist"}
            onClick={() => setSelectedType("tourist")}
          />

          <UserTypeCard
            icon={expatriateIcon}
            title="Expatriate"
            description="A foreign national living or working in Nigeria"
            isSelected={selectedType === "expatriate"}
            onClick={() => setSelectedType("expatriate")}
          />
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedType}
          variant="filled"
          size="lg"
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          fullWidth
          radius="xl"
          rightSection={<ArrowUpRight size={18} />}
        >
          Continue
        </Button>

        <SecurityBadges />
      </div>
    </>
  );
}
