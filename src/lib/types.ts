export type EventScore = {
  name: string;
  score: number;
}

export type Unit = {
  id: string;
  name: string;
  events: EventScore[];
  photoAccessCount: number;
  credentialId: string;
};

export type GalleryImage = {
  id:string;
  src: string;
  alt: string;
  unitId?: string;
  aiHint: string;
};

export type AppEvent = {
  id: string;
  name: string;
};

export type VenueDetails = {
  id: string;
  roomNumber: string;
  item: string;
  timestamp: number;
};
