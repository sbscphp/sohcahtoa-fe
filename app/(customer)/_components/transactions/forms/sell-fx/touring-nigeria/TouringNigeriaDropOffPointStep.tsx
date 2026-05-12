"use client";

import PickupPointStep, {
  type PickupPointFormData,
} from "@/app/(customer)/_components/transactions/forms/PickupPointStep";

export type TouringNigeriaDropOffPointFormData = PickupPointFormData;

interface TouringNigeriaDropOffPointStepProps {
  initialValues?: Partial<TouringNigeriaDropOffPointFormData>;
  onSubmit: (data: TouringNigeriaDropOffPointFormData) => void;
  onBack?: () => void;
  locations?: { id: string; name: string; address: string }[];
  states?: string[];
  cities?: string[];
}

export default function TouringNigeriaDropOffPointStep({
  initialValues,
  onSubmit,
  onBack,
  locations,
  states,
  cities,
}: Readonly<TouringNigeriaDropOffPointStepProps>) {
  return (
    <PickupPointStep
      preferenceMode="pickup-only"
      title="Select Drop Off Point"
      subtitle="Select the closest sohcahtoa office to drop off your cash"
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
