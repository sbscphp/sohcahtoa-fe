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
      subtitle="Select the closest sohcahtoa office to pick up your card and cash"
      submitLabel="Next"
      initialValues={initialValues}
      onSubmit={onSubmit as (data: PickupPointFormData) => void}
      onBack={onBack}
      locations={locations}
      states={states}
      cities={cities}
    />
  );
}
