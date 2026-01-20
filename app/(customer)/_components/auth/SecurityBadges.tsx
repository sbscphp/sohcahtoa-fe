import { cbnLogo } from "@/app/assets/asset";
import Image from "next/image";

export function SecurityBadges() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-body-text-100 text-sm mt-6 font-medium">
      <div className="flex items-center gap-2">
        <span>Secured & Encrypted.</span>
      </div>
      <div className="flex items-center gap-2">
        <Image src={cbnLogo} alt="CBN Regulated" />
        <span>CBN Regulated.</span>
      </div>
    </div>
  );
}
