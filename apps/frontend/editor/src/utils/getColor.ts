import treasureMapPalette from '@/material-ui/palettes/treasure-map';

type Palette = typeof treasureMapPalette.palette;

type DotPath<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends string
      ? K
      : T[K] extends object
      ? `${K}.${DotPath<T[K]>}`
      : never
    : never;
}[keyof T];

export type Color = DotPath<Palette>;

export const getColor = (path: Color): string => {
  const keys = (path as string).split('.');
  let value: any = treasureMapPalette.palette;

  for (const key of keys) {
    value = value[key];
  }

  return value;
};
