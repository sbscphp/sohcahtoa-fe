"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

type HeaderContentContextType = {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
};

const HeaderContentContext = createContext<HeaderContentContextType | undefined>(undefined);

export function HeaderContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);
  
  // Memoize setContent to prevent unnecessary re-renders
  const memoizedSetContent = useCallback((newContent: ReactNode | null) => {
    setContent(newContent);
  }, []);
  
  // Memoize the context value to prevent recreating on every render
  const value = useMemo(() => ({
    content,
    setContent: memoizedSetContent
  }), [content, memoizedSetContent]);
  
  return (
    <HeaderContentContext.Provider value={value}>
      {children}
    </HeaderContentContext.Provider>
  );
}

export function useHeaderContent() {
  const context = useContext(HeaderContentContext);
  if (!context) {
    throw new Error('useHeaderContent must be used within HeaderContentProvider');
  }
  return context;
}
