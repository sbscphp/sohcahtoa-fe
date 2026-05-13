"use client";

import PickupPointStep, {
  type PickupPointFormData,
} from "../../PickupPointStep";

export type { PickupPointFormData } from "../../PickupPointStep";

interface PTAPickupPointStepProps {
  initialValues?: Partial<PickupPointFormData>;
  onSubmit: (data: PickupPointFormData) => void;
  onBack?: () => void;
  locations?: { id: string; name: string; address: string }[];
  states?: string[];
  cities?: string[];
}

export default function PTAPickupPointStep({
  initialValues,
  onSubmit,
  onBack,
  locations,
  states,
  cities,
}: Readonly<PTAPickupPointStepProps>) {
  return (
    <PickupPointStep
      preferenceMode="pickup-only"
      title="Choose Your Payout Method"
      subtitle="Tailor how you receive your funds to fit your needs."
      submitLabel="Next"
      initialValues={initialValues}
      onSubmit={onSubmit as (data: PickupPointFormData) => void}
      onBack={onBack}
      locations={locations}
      states={states}
      cities={cities}
      enablePayoutMethod
      bankSelectionMode="separate"
    />
  );
}
