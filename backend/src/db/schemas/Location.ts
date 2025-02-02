import { Schema } from 'mongoose';
import { ILocation } from '../interfaces/Location';

export const locationSchema = new Schema<ILocation>({
  lat: Number,
  lng: Number,
  radius: Number,
});
