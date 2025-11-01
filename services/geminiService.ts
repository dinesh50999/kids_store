import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { IllustratedStory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storyResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'The title of the story.'
    },
    story_text: {
      type: Type.STRING,
      description: "The full text of the story, around 300 words. The story must contain 2-3 placeholders like [IMAGE_1], [IMAGE_2], etc., where illustrations should be placed."
    },
    moral: {
      type: Type.STRING,
      description: 'A one-line moral for the story.'
    },
    image_summaries: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "An array of 2-3 simple, descriptive summaries for an AI image generator. Each summary should correspond to a placeholder in the story_text. Describe the main character, the setting, and the action in a friendly, cartoon style with bright colors. Example: ['A little girl picking glowing berries...', 'The girl sharing the berries with a glowing fox...']"
    }
  },
  required: ['title', 'story_text', 'moral', 'image_summaries'],
};

const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Create a bright, friendly, cartoon-style illustration for a children's story. Scene: ${prompt}. Use rounded shapes, exaggerated expressions, warm palette, and no text in the image. Keep composition simple so the character(s) are clearly visible on a phone screen.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '3:4',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("There was a problem illustrating your story. Please try again.");
    }
};


export const generateStory = async (category: string): Promise<IllustratedStory | null> => {
  const systemInstruction = "You are a creative storyteller for children aged 5–10. Your stories are around 300 words, positive, have a happy ending, and contain a simple moral. You must avoid violence, scary situations, or complex adult themes. For each story, you must provide 2-3 concise image summaries in an array. The story text must contain placeholders like [IMAGE_1], [IMAGE_2], etc., where the images should be inserted. You must return the story as a JSON object matching the provided schema.";
  
  const prompt = `Write a short story for a child about the category "${category}".`;

  try {
    const storyResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: storyResponseSchema,
      },
    });
    
    const text = storyResponse.text;
    if (!text) {
      throw new Error("Received an empty response from the AI for the story.");
    }
    
    const storyData = JSON.parse(text);

    if (!storyData.title || !storyData.story_text || !storyData.moral || !storyData.image_summaries || !Array.isArray(storyData.image_summaries)) {
        throw new Error("Received incomplete story data from the AI.");
    }
    
    // Generate all images in parallel
    const imageUrls = await Promise.all(
        storyData.image_summaries.map((summary: string) => generateImage(summary))
    );

    return {
        title: storyData.title,
        body: storyData.story_text,
        moral: storyData.moral,
        imageUrls: imageUrls,
    };

  } catch (error) {
    console.error("Error in story generation process:", error);
    if (error instanceof SyntaxError) {
      throw new Error("The AI returned a story in an unexpected format. Please try again.");
    }
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("No audio data was generated.");
        }

        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("There was a problem preparing the audio for your story. Please try again.");
    }
};