export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string; // Tailwind token (e.g., "emerald-500")
  sortOrder: number;
  ownerId: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

