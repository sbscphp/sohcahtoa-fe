"use client";

import { useEffect } from 'react';
import { useHeaderContent } from '../_contexts/HeaderContentContext';

export function useSetHeaderContent(content: React.ReactNode) {
  const { setContent } = useHeaderContent();
  
  useEffect(() => {
    setContent(content);
    
    // Cleanup: Remove content when component unmounts or navigates away
    return () => {
      setContent(null);
    };
    // setContent is now stable (memoized in context), so this won't cause infinite loops
    // We need content in dependencies so updates are reflected
  }, [content, setContent]);
}
