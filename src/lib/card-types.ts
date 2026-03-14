export interface CardData {
  vehicle: {
    brand: string;
    plate: string;
  };
  announcement?: string;
  owner?: {
    name?: string;
    phone?: string;
    phone2?: string;
    email?: string;
    telegram?: string;
    whatsapp?: string;
  };
  quickActions: {
    evacuation: boolean;
    damage: boolean;
    vandalism: boolean;
    message: boolean;
  };
}

export function encodeCardData(data: CardData): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function decodeCardData(encoded: string): CardData | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}
