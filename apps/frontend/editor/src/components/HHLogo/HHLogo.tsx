interface HHLogoProps {
  size?: number;
}

export const HHLogo = ({ size = 22 }: HHLogoProps) => {
  return <img src="/logo.svg" alt="HedgeHunt" height={size} />;
};
