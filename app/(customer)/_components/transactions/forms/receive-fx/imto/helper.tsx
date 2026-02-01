import { moneyGram, westernUnion } from "@/app/assets/asset";
import Image from "next/image";

export const MONEYGRAM_LOGO = (
  <Image src={moneyGram} alt="MoneyGram" width={40} height={40} />
);
export const WESTERN_UNION_LOGO = (
  <Image src={westernUnion} alt="Western Union" width={40} height={40} />
);
