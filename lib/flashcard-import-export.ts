// Flashcard Import/Export Utilities
// Functions to convert flashcards to/from CSV and JSON formats

import { Flashcard, CreateFlashcardInput } from '@/types';

/**
 * Export flashcards to CSV format
 * CSV format: front,back,notes,tags
 */
export const exportToCSV = (flashcards: Flashcard[]): string => {
  // CSV Header
  const header = 'front,back,notes,tags\n';

  // Convert each flashcard to a CSV row
  const rows = flashcards.map(card => {
    // Escape quotes and wrap in quotes if contains comma or newline
    const escapedFront = escapeCSVField(card.front);
    const escapedBack = escapeCSVField(card.back);
    const escapedNotes = escapeCSVField(card.notes || '');
    const tagsString = card.tags.join(';'); // Use semicolon to separate tags

    return `${escapedFront},${escapedBack},${escapedNotes},${tagsString}`;
  }).join('\n');

  return header + rows;
};

/**
 * Helper function to escape CSV fields
 * Wraps in quotes if contains comma, newline, or quotes
 */
const escapeCSVField = (field: string): string => {
  if (!field) return '""';

  // If field contains comma, newline, or quotes, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return `"${field}"`;
};

/**
 * Parse CSV string into flashcard data
 * Expected format: front,back,notes,tags
 */
export const parseCSV = (csvString: string): CreateFlashcardInput[] => {
  const lines = csvString.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // Skip header row
  const dataRows = lines.slice(1);

  const flashcards: CreateFlashcardInput[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i].trim();
    if (!row) continue; // Skip empty rows

    try {
      const fields = parseCSVRow(row);

      if (fields.length < 2) {
        console.warn(`Row ${i + 2}: Skipping row with less than 2 fields`);
        continue;
      }

      const front = fields[0]?.trim();
      const back = fields[1]?.trim();
      const notes = fields[2]?.trim() || undefined;
      const tagsString = fields[3]?.trim() || '';
      const tags = tagsString ? tagsString.split(';').map(t => t.trim().toLowerCase()).filter(Boolean) : [];

      if (!front || !back) {
        console.warn(`Row ${i + 2}: Skipping row with empty front or back`);
        continue;
      }

      flashcards.push({
        front,
        back,
        notes,
        tags,
        deckId: '', // Will be set when importing
      });
    } catch (error) {
      console.error(`Error parsing row ${i + 2}:`, error);
      continue;
    }
  }

  return flashcards;
};

/**
 * Parse a single CSV row, handling quoted fields
 */
const parseCSVRow = (row: string): string[] => {
  const fields: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add last field
  fields.push(currentField);

  return fields;
};

/**
 * Export flashcards to JSON format
 */
export const exportToJSON = (flashcards: Flashcard[]): string => {
  // Only include relevant fields for import
  const exportData = flashcards.map(card => ({
    front: card.front,
    back: card.back,
    notes: card.notes,
    tags: card.tags,
  }));

  return JSON.stringify(exportData, null, 2);
};

/**
 * Parse JSON string into flashcard data
 */
export const parseJSON = (jsonString: string): CreateFlashcardInput[] => {
  try {
    const data = JSON.parse(jsonString);

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of flashcards');
    }

    const flashcards: CreateFlashcardInput[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (!item.front || !item.back) {
        console.warn(`Item ${i + 1}: Skipping item with missing front or back`);
        continue;
      }

      flashcards.push({
        front: item.front.trim(),
        back: item.back.trim(),
        notes: item.notes?.trim() || undefined,
        tags: Array.isArray(item.tags) ? item.tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [],
        deckId: '', // Will be set when importing
      });
    }

    return flashcards;
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Download string as file
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};

/**
 * Get example CSV template
 */
export const getCSVTemplate = (): string => {
  return `front,back,notes,tags
"What is the capital of France?","Paris","France is in Europe","geography;europe"
"What is 2 + 2?","4","Basic arithmetic","math;easy"
"Who wrote Romeo and Juliet?","William Shakespeare","Famous playwright","literature;difficult"`;
};

/**
 * Get example JSON template
 */
export const getJSONTemplate = (): string => {
  return JSON.stringify([
    {
      front: "What is the capital of France?",
      back: "Paris",
      notes: "France is in Europe",
      tags: ["geography", "europe"]
    },
    {
      front: "What is 2 + 2?",
      back: "4",
      notes: "Basic arithmetic",
      tags: ["math", "easy"]
    },
    {
      front: "Who wrote Romeo and Juliet?",
      back: "William Shakespeare",
      notes: "Famous playwright",
      tags: ["literature", "difficult"]
    }
  ], null, 2);
};
