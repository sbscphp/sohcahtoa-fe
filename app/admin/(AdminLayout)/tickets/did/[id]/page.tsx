"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, Text, Title, Button, Group } from "@mantine/core";
import { adminRoutes } from "@/lib/adminRoutes";
import { ArrowLeft } from "lucide-react";

export default function UpdateIncidentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const handleBack = () => router.push(adminRoutes.adminTicketDetails(id));

  return (
    <div className="max-w-3xl mx-auto">
      <Card radius="lg" p="xl" className="bg-white shadow-sm">
        <Group mb="xl">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<ArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Group>
        <Title order={3} className="text-gray-900 font-bold! text-xl!" mb="xs">
          Update Incident
        </Title>
        <Text size="sm" c="dimmed" mb="xl">
          Update incident details for ticket #{id}. Full edit form can be added here later.
        </Text>
      </Card>
    </div>
  );
}
