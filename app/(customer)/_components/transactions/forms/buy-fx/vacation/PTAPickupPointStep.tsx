"use client";

import PickupPointStep, {
  type PickupPointFormData,
} from "../../PickupPointStep";

export type { PickupPointFormData };

interface PTAPickupPointStepProps {
  initialValues?: Partial<PickupPointFormData>;
  onSubmit: (data: PickupPointFormData) => void;
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

export default function PTAPickupPointStep({
  initialValues,
  onSubmit,
  onBack,
  locations = DEFAULT_LOCATIONS,
  states = DEFAULT_STATES,
  cities = DEFAULT_CITIES,
}: PTAPickupPointStepProps) {
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
