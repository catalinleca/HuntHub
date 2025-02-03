export interface IUser {
  id: string;
  firebaseId: string;
  email: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}
