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

const DEFAULT_LOCATIONS = [
  { id: "1", name: "SOHCAHTOA LAGOS", address: "ADEOLA ODEKU . RD VICTORIA ISLAND" },
  { id: "2", name: "TRIGONOMETRY HUB", address: "FEMI OLADELE. RD LAGOS" },
  { id: "3", name: "GEOMETRIC SPACE", address: "BOLA AWOYEMI. RD YABA" },
  { id: "4", name: "CALCULUS CIRCLE", address: "KELECHI NWANKWO. RD LAGOS" },
];
const DEFAULT_STATES = ["Lagos", "Abuja", "Port Harcourt", "Kano"];
const DEFAULT_CITIES = ["Lagos Island", "Victoria Island", "Ikoyi", "Lekki"];

export default function BTAPickupPointStep({
  initialValues,
  onSubmit,
  onBack,
  locations = DEFAULT_LOCATIONS,
  states = DEFAULT_STATES,
  cities = DEFAULT_CITIES,
}: BTAPickupPointStepProps) {
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
