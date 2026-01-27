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

const DEFAULT_LOCATIONS = [
  { id: "1", name: "SOHCAHTOA LAGOS", address: "ADEOLA ODEKU . RD VICTORIA ISLAND" },
  { id: "2", name: "TRIGONOMETRY HUB", address: "LAGOS ISLAND" },
  { id: "3", name: "GEOMETRIC SPACE", address: "LAGOS MAINLAND" },
  { id: "4", name: "CALCULUS CIRCLE", address: "IKOYI" },
];
const DEFAULT_STATES = ["Lagos", "Abuja", "Port Harcourt", "Kano"];
const DEFAULT_CITIES = ["Lagos Island", "Victoria Island", "Ikoyi", "Lekki"];

export default function TouringNigeriaDropOffPointStep({
  initialValues,
  onSubmit,
  onBack,
  locations = DEFAULT_LOCATIONS,
  states = DEFAULT_STATES,
  cities = DEFAULT_CITIES,
}: TouringNigeriaDropOffPointStepProps) {
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
