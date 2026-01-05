import { treasureMapPaletteConfig } from '../presets/treasure-map';

/**
 * Recursively extracts all nested keys from an object type as dot-notation strings
 * e.g. { primary: { main: string } } → 'primary' | 'primary.main'
 */
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? ObjectType[Key] extends string
      ? `${Key}`
      : `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type PaletteColor = NestedKeyOf<typeof treasureMapPaletteConfig>;
