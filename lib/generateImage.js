/**
 * Auto-generate a featured image for a blog post using Gemini 2.5 Flash Image.
 * Runs asynchronously after post save — doesn't block the publish response.
 * Crops to 16:9 aspect ratio using sharp.
 */
const { GoogleGenAI } = require('@google/genai');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API || process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn('[ImageGen] WARNING: No GEMINI_API or GEMINI_API_KEY set — image generation disabled');
}

async function generateFeaturedImage(post) {
    if (!GEMINI_API_KEY) return null;

    const { slug, title, excerpt } = post;
    const imagePath = path.join(__dirname, '..', 'public', 'images', 'blog', slug + '.png');

    // Skip if image already exists
    if (fs.existsSync(imagePath)) {
        console.log(`[ImageGen] Image already exists for: ${slug}`);
        return '/images/blog/' + slug + '.png';
    }

    console.log(`[ImageGen] Generating image for: ${slug}`);

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const prompt = `Create a stunning, high-quality featured image for a health/science blog post titled: ${title}.
Style: Scientific medical illustration with a clean, modern aesthetic. Professional quality.
Color palette: Deep teals, rich blues, warm golds, soft purples — matching a wellness brand.
Mood: Hopeful, scientific, natural healing.
Focus on the key concepts from: ${excerpt?.substring(0, 200) || title}
CRITICAL: No text, no words, no letters, no typography anywhere in the image.
Generate at a SQUARE 1:1 aspect ratio (it will be cropped to 16:9).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseModalities: ['IMAGE', 'TEXT'] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const rawBuffer = Buffer.from(part.inlineData.data, 'base64');

                // Crop to 16:9 (center crop) using sharp
                const metadata = await sharp(rawBuffer).metadata();
                const originalWidth = metadata.width;
                const originalHeight = metadata.height;

                // Target: 16:9 ratio, crop from center
                const targetRatio = 16 / 9;
                const currentRatio = originalWidth / originalHeight;

                let cropWidth, cropHeight, left, top;

                if (currentRatio > targetRatio) {
                    // Image is wider than 16:9 — crop width
                    cropHeight = originalHeight;
                    cropWidth = Math.round(originalHeight * targetRatio);
                    left = Math.round((originalWidth - cropWidth) / 2);
                    top = 0;
                } else {
                    // Image is taller than 16:9 — crop height
                    cropWidth = originalWidth;
                    cropHeight = Math.round(originalWidth / targetRatio);
                    left = 0;
                    top = Math.round((originalHeight - cropHeight) / 2);
                }

                const croppedBuffer = await sharp(rawBuffer)
                    .extract({ left, top, width: cropWidth, height: cropHeight })
                    .resize(1024, 576) // Final size: 1024x576 (16:9)
                    .png()
                    .toBuffer();

                fs.writeFileSync(imagePath, croppedBuffer);
                console.log(`[ImageGen] Saved ${slug}.png (${Math.round(croppedBuffer.length / 1024)}KB, 1024x576)`);
                return '/images/blog/' + slug + '.png';
            }
        }

        console.log(`[ImageGen] No image in Gemini response for: ${slug}`);
        return null;
    } catch (err) {
        console.error(`[ImageGen] Failed for ${slug}:`, err.message);
        return null;
    }
}

module.exports = { generateFeaturedImage };
