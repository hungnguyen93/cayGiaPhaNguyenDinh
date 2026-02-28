export interface FamilyMember {
  id: number;
  name: string;
  gender: string;
  birthDate: string;       // dd/mm/yyyy
  deathDate?: string;      // dd/mm/yyyy
  fatherId?: number;
  motherId?: number;
  note?: string;
  relationshipType?: 'son-in-law' | 'daughter-in-law';
  spouseId?: number;
  children?: FamilyMember[];
}
