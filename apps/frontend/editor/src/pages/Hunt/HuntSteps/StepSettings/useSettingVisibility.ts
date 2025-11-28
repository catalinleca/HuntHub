import { useState, useEffect } from 'react';

export const useSettingVisibility = (isEnabled: boolean, onEnable: () => void, onDisable: () => void) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isEnabled) setIsClosing(false);
  }, [isEnabled]);

  const isVisible = isEnabled && !isClosing;

  const toggle = () => {
    if (isClosing) {
      setIsClosing(false);
    } else if (isEnabled) {
      setIsClosing(true);
    } else {
      onEnable();
    }
  };

  const handleExited = () => {
    if (isClosing) {
      onDisable();
      setIsClosing(false);
    }
  };

  return { isVisible, toggle, handleExited };
};
