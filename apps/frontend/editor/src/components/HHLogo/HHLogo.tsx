interface HHLogoProps {
  size?: number;
}

export const HHLogo = ({ size = 32 }: HHLogoProps) => {
  return <img src="/logo.svg" alt="HedgeHunt" height={size} />;
};
