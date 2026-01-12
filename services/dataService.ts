import { Alumni } from '../types';

// The ID from your provided URL: https://docs.google.com/spreadsheets/d/12aodSbtnxiDmiSwcCrVEP0NFBbWYDJtQpa7ILXQ5fZg/
const SHEET_ID = '12aodSbtnxiDmiSwcCrVEP0NFBbWYDJtQpa7ILXQ5fZg';

// We use the Google Visualization API endpoint (?tqx=out:csv) as it handles CORS better 
// than the standard /export?format=csv URL for public sheets.
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// Map CSV headers (uppercase) to our internal Alumni interface keys
const COLUMN_MAP: Record<string, keyof Alumni> = {
  'BAC': 'bac',
  'NOM': 'nom',
  'PRENOM': 'prenom',
  'TEL': 'tel',
  'E_MAIL': 'email',
  'EMAIL': 'email', // Handle potential variation
  'CELL': 'cell',
  'DATENAISS': 'date_naiss',
  'LIEUNAISS': 'lieu_naiss',
  'SEXE': 'sexe',
  'VILLE': 'ville',
  'PAYS': 'pays',
  'PR': 'pr',
  'ETUDES': 'etudes',
  'PROFESSION': 'profession'
};

const parseCSV = (text: string): Alumni[] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  // Normalize line endings to \n to simplify parsing
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote ("") inside quotes: add one quote and skip the next
        currentField += '"';
        i++; 
      } else {
        // Toggle quote boundary
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField);
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // End of row
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add the last field/row if processed text didn't end with a newline
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  // Parse Headers from the first row
  const headers = rows[0].map(h => h.toUpperCase().replace(/[^A-Z0-9_]/g, ''));
  
  const data: Alumni[] = [];

  for (let i = 1; i < rows.length; i++) {
    const rowValues = rows[i];
    // Skip empty rows or rows with extremely few columns (likely artifacts)
    if (rowValues.length <= 1) continue;

    const alumnus: any = { id: `row-${i}` };
    let hasData = false;

    headers.forEach((header, index) => {
      const key = COLUMN_MAP[header];
      if (key && rowValues[index] !== undefined) {
        let value = rowValues[index].trim();
        
        // Data Cleaning Logic
        if (key === 'bac') {
            // Remove "BAC" prefix if present (case insensitive) and spaces
            value = value.replace(/^BAC\s*/i, '');
            // If the value is too long (> 15 chars) or contains commas, it's likely a parsing error or garbage.
            if (value.length > 15 || value.includes(',')) {
                value = ''; 
            }
        }

        alumnus[key] = value;
        if (value) hasData = true;
      }
    });

    // Only add if we actually mapped some meaningful data and have a name
    if (hasData && alumnus.nom) {
        // Fill missing required fields with empty strings to satisfy Typescript
        const requiredKeys: (keyof Alumni)[] = ['bac', 'nom', 'prenom', 'tel', 'email', 'cell', 'date_naiss', 'lieu_naiss', 'sexe', 'ville', 'pays', 'pr', 'etudes', 'profession'];
        requiredKeys.forEach(k => {
          if (!alumnus[k]) alumnus[k] = '';
        });
        
        data.push(alumnus as Alumni);
    }
  }

  return data;
};

export const fetchAlumniData = async (): Promise<Alumni[]> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Error fetching sheet: ${response.statusText}`);
    }
    const text = await response.text();
    
    // Check if we got HTML instead of CSV (common if permissions are wrong)
    if (text.trim().startsWith('<!DOCTYPE html>') || text.includes('<html')) {
      throw new Error("Received HTML instead of CSV. Please ensure the Google Sheet is shared with 'Anyone with the link' as 'Viewer'.");
    }

    const parsedData = parseCSV(text);
    return parsedData;
  } catch (error) {
    console.error("Failed to fetch live data:", error);
    // Return empty array so the app doesn't crash.
    return []; 
  }
};