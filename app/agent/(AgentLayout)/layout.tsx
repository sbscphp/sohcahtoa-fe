import AgentLayoutShell from '../_components/layout/AgentLayoutShell';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AgentLayoutShell>{children}</AgentLayoutShell>;
}
