"use client";

import PickupPointStep, {
  type PickupPointFormData,
} from "../../PickupPointStep";

export type BTAPickupPointFormData = PickupPointFormData;

interface BTAPickupPointStepProps {
  initialValues?: Partial<BTAPickupPointFormData>;
  onSubmit: (data: BTAPickupPointFormData) => void;
  onBack?: () => void;
  locations?: { id: string; name: string; address: string }[];
  states?: string[];
  cities?: string[];
}

export default function BTAPickupPointStep({
  initialValues,
  onSubmit,
  onBack,
  locations,
  states,
  cities,
}: Readonly<BTAPickupPointStepProps>) {
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
