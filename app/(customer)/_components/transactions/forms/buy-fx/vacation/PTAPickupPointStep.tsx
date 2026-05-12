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
