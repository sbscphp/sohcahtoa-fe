"use client";

import { useState } from "react";
import { Modal, TextInput, Radio, ScrollArea, Text } from "@mantine/core";
import { Search } from "lucide-react";

interface WorkflowActionModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (action: string) => void;
}

const WORKFLOW_ACTIONS = [
  "Create BTA Transaction",
  "Create PTA Transaction",
  "Franchise Management",
  "Workflow Management",
];

export default function WorkflowActionModal({
  opened,
  onClose,
  onSelect,
}: WorkflowActionModalProps) {
  const [search, setSearch] = useState("");

  const filteredActions = WORKFLOW_ACTIONS.filter((action) =>
    action.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (action: string) => {
    onSelect(action);
    onClose();
    setSearch("");
  };

  const handleClose = () => {
    onClose();
    setSearch("");
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div>
          <Text fw={700} size="lg" className="text-gray-900">
            Workflow Action
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Select a an option below
          </Text>
        </div>
      }
      centered
      radius="lg"
      size="md"
      classNames={{ title: "!mb-0" }}
    >
      <div className="space-y-4">
        <TextInput
          placeholder="Enter keyword to search"
          leftSection={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="md"
        />

        <ScrollArea h={300} type="scroll">
          <Radio.Group value="">
            <div className="space-y-2">
              {filteredActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleSelect(action)}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition-all hover:border-orange-300 hover:bg-orange-50/50"
                >
                  <Radio
                    value={action}
                    label={action}
                    color="orange"
                    classNames={{
                      label: "text-sm font-medium text-gray-900 cursor-pointer",
                    }}
                  />
                </button>
              ))}
            </div>
          </Radio.Group>
        </ScrollArea>
      </div>
    </Modal>
  );
}
