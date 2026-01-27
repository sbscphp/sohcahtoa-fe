import ViewSupportDetail from "@/app/(customer)/_components/support/ViewSupportDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewSupportPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="w-full">
      <ViewSupportDetail id={id} />
    </div>
  );
}
