import { Schema } from 'mongoose';

export interface ILocation {
  lat: number;
  lng: number;
  radius: number;
  address?: string;
}

export const locationSchema = new Schema<ILocation>({
  lat: Number,
  lng: Number,
  radius: Number,
  address: { type: String, required: false },
});
