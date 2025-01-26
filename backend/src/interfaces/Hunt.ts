interface Hunt {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  isPublished: boolean;
  currentVersion: number;
  status: 'draft' | 'published' | 'archived';
  visibility: 'private' | 'public' | 'unlisted'; // Can be added later
  startLocation?: {
    lat: number;
    lng: number;
    radius: number; // Activation radius in meters
  };
  createdAt: Date;
  updatedAt: Date;
}
