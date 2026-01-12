export interface Alumni {
  id: string;
  bac: string;
  nom: string;
  prenom: string;
  tel: string;
  email: string;
  cell: string;
  date_naiss: string;
  lieu_naiss: string;
  sexe: string;
  ville: string;
  pays: string;
  pr: string;
  etudes: string;
  profession: string;
}

export interface SearchFilters {
  query: string; // General text search
  bac: string;
  pays: string;
  profession: string;
  etudes: string;
}

export const DATA_COLUMNS = [
  "BAC", "NOM", "PRENOM", "TEL", "E_MAIL", "CELL", 
  "DATENAISS", "LIEUNAISS", "SEXE", "VILLE", "PAYS", 
  "PR", "ETUDES", "PROFESSION"
];