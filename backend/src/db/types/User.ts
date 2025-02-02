export interface IUser {
  firebaseUid: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserFullProfile {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  bio: string;
}
