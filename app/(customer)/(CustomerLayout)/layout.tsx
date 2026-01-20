import CustomerLayoutShell from '../_components/layout/CustomerLayoutShell';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayoutShell>{children}</CustomerLayoutShell>;
}
