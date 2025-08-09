import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.post('/api/generate-quote', async (req, res) => {
  try {
    const prompt = "generate a spanish quote. respond with only the quote, no additional text. do not include quotation marks.";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    let plainText = response.text;
    console.log('Gemini raw response:', response.text);
    if (!plainText || typeof plainText !== 'string') plainText = '';
    // Remove accents from the solution
    function removeAccents(str) {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    plainText = plainText.trim().replace(/^\*+|\*+$/g, '');
    // Remove accents but keep Ñ as a distinct character
    plainText = plainText.trim().replace(/^\*+|\*+$/g, '');
    plainText = removeAccents(plainText);
    console.log('Sanitized solution:', plainText);
    console.log("Generated quote:", plainText);

    // Monoalphabetic substitution cipher
    function aristocratCipher(text) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      // Shuffle alphabet for mapping
      function shuffle(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
      }
      const cipherAlphabet = shuffle(alphabet);
      const map = {};
      for (let i = 0; i < alphabet.length; i++) {
        map[alphabet[i]] = cipherAlphabet[i];
      }
      // Map each letter, preserve case, spaces, punctuation
      // Remove accents from ciphertext
      text = removeAccents(text);
      return text.split('').map(char => {
        const upper = char.toUpperCase();
        if (alphabet.includes(upper)) {
          // Preserve original case
          return char === upper ? map[upper] : map[upper].toLowerCase();
        }
        return char;
      }).join('');
    }

    const aristocrat = aristocratCipher(plainText);
    res.json({ text: aristocrat, solution: plainText });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Failed to fetch quote.' });
  }
});

export default app;