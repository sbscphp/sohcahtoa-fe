"use client";

import { MantineProvider, createTheme, MantineColorsTuple } from '@mantine/core';

const myColor: MantineColorsTuple = [
  '#fff0e4',
  '#ffe0ce',
  '#fdbe9e',
  '#fb9b69',
  '#f97d3c',
  '#f96a20',
  '#f96011',
  '#dd4f05',
  '#c64501',
  '#ad3900'
];


const theme = createTheme({
  colors: {
    myColor,
  },
  primaryColor: 'myColor',
  primaryShade: 4,
});

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MantineProvider
      defaultColorScheme="light"
      theme={theme}
    >
      {children}
    </MantineProvider>
  );
}