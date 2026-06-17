import { Suspense } from "react";
import AgentLayoutShell from '../_components/layout/AgentLayoutShell';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AgentLayoutShell>{children}</AgentLayoutShell>
    </Suspense>
  );
}
