import { Schema } from 'mongoose';

export interface ILocation {
  lat: number;
  lng: number;
  radius: number;
}

export const locationSchema = new Schema<ILocation>({
  lat: Number,
  lng: Number,
  radius: Number,
});
