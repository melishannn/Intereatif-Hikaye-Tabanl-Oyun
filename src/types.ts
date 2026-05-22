export interface Stats {
  health: number;
  resilience: number;
  success: number;
  talent: number;
}

export interface Character {
  name: string;
  gender: string;
  imageUrl?: string;
  hairColor: string;
  clothingStyle: string;
  physicalTrait: string;
  vocalTone: string;
  danceStyle: string;
  trait: string;
  height: string;
  bodyType: string;
  background: string;
}

export type LocationId = 'room' | 'common' | 'vocal' | 'dance' | 'interview' | 'stage' | 'phone';

export interface Choice {
  text: string;
  effects: Partial<Stats>;
  message: string;
  traitTag?: string; // Hangi kişiliğe uygun olduğunu belirten etiket (örn: 'Karizmatik', 'Utangaç')
  socialFeedback?: { text: string; isPositive: boolean }[];
}

export interface GameEvent {
  id: string;
  location: LocationId;
  description: string;
  choices: Choice[];
}

export interface BookQuote {
  quote: string;
  author?: string;
  book?: string;
  choices: Choice[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SocialComment {
  id: string;
  user: string;
  text: string;
  isPositive: boolean;
  likes: number;
  time: string;
  analysisNote?: string;
  replied?: boolean;
  actionTaken?: 'blocked' | 'calmed' | 'replied';
  liked?: boolean;
  fanReply?: string;
}
