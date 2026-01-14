import { Table } from "@mantine/core";

type Props = {
  headers: string[];
  children: React.ReactNode;
};

function TableContainer({ headers, children }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <Table
        verticalSpacing="sm"
        horizontalSpacing="md"
        highlightOnHover
        withTableBorder
        className="min-w-[800px]"
      >
        <Table.Thead>
          <Table.Tr>
            {headers.map((item) => (
              <Table.Th
                key={item}
                className="text-sm! font-semibold text-[#7C8496]! whitespace-nowrap bg-[#F8F9FB]"
              >
                {item}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{children}</Table.Tbody>
      </Table>
    </div>
  );
}

export default TableContainer;
