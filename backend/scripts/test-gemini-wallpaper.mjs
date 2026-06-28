/**
 * Test rapide Gemini — depuis backend/ :
 *   $env:GEMINI_API_KEY="ta_cle"; node scripts/test-gemini-wallpaper.mjs
 */
import axios from 'axios';

const key = process.env.GEMINI_API_KEY?.trim();
if (!key) {
  console.error('GEMINI_API_KEY manquante');
  process.exit(1);
}

const prompt =
  'Vertical 9:16 mobile wallpaper of Pokémon Pikachu, electric energy, epic landscape, no text.';

const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    responseModalities: ['TEXT', 'IMAGE'],
    imageConfig: { aspectRatio: '9:16' },
  },
};

for (const model of ['gemini-2.5-flash-image']) {
  for (const version of ['v1beta', 'v1']) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`;
    try {
      const res = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        timeout: 120_000,
      });
      const parts = res.data?.candidates?.[0]?.content?.parts ?? [];
      const img = parts.find((p) => p.inlineData?.data);
      if (img) {
        console.log(`OK ${model} ${version} — image ${img.inlineData.data.length} chars base64`);
        process.exit(0);
      }
      console.log(`NO IMAGE ${model} ${version}`, JSON.stringify(res.data).slice(0, 200));
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data).slice(0, 300) : e.message;
      console.log(`FAIL ${model} ${version}:`, msg);
    }
  }
}

console.error('Aucun modèle Gemini image ne fonctionne avec cette clé');
process.exit(1);
