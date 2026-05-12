"use client";

import PickupPointStep, {
  type PickupPointFormData,
} from "../../PickupPointStep";

export type TouristPickupPointFormData = PickupPointFormData;

interface TouristPickupPointStepProps {
  initialValues?: Partial<TouristPickupPointFormData>;
  onSubmit: (data: TouristPickupPointFormData) => void;
  onBack?: () => void;
  locations?: { id: string; name: string; address: string }[];
  states?: string[];
  cities?: string[];
}

export default function TouristPickupPointStep({
  initialValues,
  onSubmit,
  onBack,
  locations,
  states,
  cities,
}: Readonly<TouristPickupPointStepProps>) {
  return (
    <PickupPointStep
      preferenceMode="pickup-only"
      subtitle="Select the closest sohcahtoa office to pick up your prepaid card"
      submitLabel="Save"
      initialValues={initialValues}
      onSubmit={onSubmit as (data: PickupPointFormData) => void}
      onBack={onBack}
      locations={locations}
      states={states}
      cities={cities}
    />
  );
}
