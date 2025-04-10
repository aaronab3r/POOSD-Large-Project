export interface JWTPayLoad {
    userId: number;
    firstName: string;
    lastName: string;
}

export interface Finding {
  id: number;
  imageUrl: string;
  location: string;
  date: Date;
  keywords: string[];
}