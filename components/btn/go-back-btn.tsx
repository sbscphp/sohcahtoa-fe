'use client';

import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface IGoBackBtnProps {
  children: ReactNode;
}

const GoBackBtn = ({ children }: IGoBackBtnProps) => {
  const router = useRouter();
  return (
    <Button radius="xl" onClick={() => router.back()} className="min-w-fit">
      {children}
    </Button>
  );
};

export default GoBackBtn;
