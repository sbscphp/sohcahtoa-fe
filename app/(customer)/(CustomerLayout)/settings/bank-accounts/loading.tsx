import { Loader } from "@mantine/core";

export default function BankAccountsSettingsLoading() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-white">
      <Loader size="md" />
    </div>
  );
}
