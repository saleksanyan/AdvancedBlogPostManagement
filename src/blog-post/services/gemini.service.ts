import { Injectable } from "@nestjs/common";
import { VertexAI } from "@google-cloud/vertexai";
import { MoodEnum } from "src/core/enums/mood.enum";

@Injectable()
export class GeminiService {
  private model;

  constructor() {
    const vertexAi = new VertexAI({
      project: process.env.GCP_PROJECT_ID,
      location: "us-central1",
    });

    this.model = vertexAi.getGenerativeModel({
      model: "gemini-2.0-flash-001",
    });
  }

  async detectMood(postText: string): Promise<MoodEnum> {
    const prompt = `
You are an assistant that classifies text into moods. Only use one of the following moods:

- sad
- happy
- excited
- neutral
- angry
- creative

Post: "${postText}"

Only respond with one of the exact mood words.
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;

    const mood = response.candidates?.[0]?.content?.parts?.[0]?.text
      .trim()
      .toLowerCase();

    if (!Object.values(MoodEnum).includes(mood as MoodEnum)) {
      throw new Error(`Unexpected mood: ${mood}`);
    }

    return mood as MoodEnum;
  }

  async enhanceText(
    originalText: string,
    makeFancy = false,
  ): Promise<{ enhancedText: string }> {
    const prompt = `
  You are a helpful writing assistant. Improve the following text by correcting grammar, spelling, and punctuation, and make it sound more natural and professional. Keep the original meaning.
  
  ${makeFancy ? "Use more sophisticated vocabulary and sentence structure to make it sound fancier." : ""}
  
  Here is the text:
  "${originalText}"

  Return only one option of answer, and give me only the text without other opinions, thank you!
  `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;

    const enhanced = response.candidates?.[0]?.content?.parts?.[0]?.text.trim();

    if (!enhanced) {
      throw new Error("Failed to enhance the text.");
    }

    return { enhancedText: enhanced };
  }
}
