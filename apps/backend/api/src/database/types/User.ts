export interface IUser {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  // Mongoose provides Date objects; mappers convert to ISO strings for API
  createdAt?: Date;
  updatedAt?: Date;
}
