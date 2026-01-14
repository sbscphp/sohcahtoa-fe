import { Table } from "@mantine/core";

type Props = {
  headers: string[];
  children: React.ReactNode;
};

function TableContainer({ headers, children }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <Table
        striped
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
                className="capitalize text-base text-primary-text! tracking-wide! whitespace-nowrap"
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
