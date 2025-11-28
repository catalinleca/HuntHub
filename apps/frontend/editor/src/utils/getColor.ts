import { treasureMapPaletteConfig } from '@/theme/palettes';

export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? ObjectType[Key] extends string
      ? `${Key}`
      : `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type Color = NestedKeyOf<typeof treasureMapPaletteConfig>;

const getNestedValue = (obj: object, path: string): string => {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current != null && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return '#000000';
    }
  }

  return typeof current === 'string' ? current : '#000000';
};

export const getColor = (path: Color): string => {
  return getNestedValue(treasureMapPaletteConfig, path);
};
