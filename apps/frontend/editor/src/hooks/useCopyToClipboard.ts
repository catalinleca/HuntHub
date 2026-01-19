import { useState, useEffect } from 'react';

export const useCopyToClipboard = (resetDelay = 2000) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), resetDelay);
    return () => clearTimeout(timeout);
  }, [copied, resetDelay]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return { copied, copy };
};
