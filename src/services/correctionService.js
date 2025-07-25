// src/services/correctionService.js

export async function fetchCorrection(text, activityType) {
    try {
      const response = await fetch('http://localhost:4000/correct', { // remplacer par l'URL prod plus tard
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, activityType }),
      });
  
      if (!response.ok) {
        throw new Error('Erreur lors de la correction');
      }
  
      const data = await response.json();
      return data.correction;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  