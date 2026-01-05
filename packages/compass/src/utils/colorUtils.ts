export const hexToRgba = (hex: string, opacity: number): string => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const createFocusRing = (hex: string, opacity = 0.1): string => {
  return `0 0 0 3px ${hexToRgba(hex, opacity)}`;
};
