
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, LessonContent, TaskResponse } from "../types";

const MODEL_TEXT = 'gemini-3-flash-preview';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const generateLesson = async (user: UserProfile, isExam: boolean = false): Promise<LessonContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Generate an English lesson step for a student.
    Level: ${user.currentLevel}
    Focused Skill/Goal: ${user.goal}
    Language: ${user.language}
    Lesson Step: ${user.currentTaskIndex + 1} of 5.

    CRITICAL RULE: This app is TEST-BASED. 
    Even for Writing or Speaking goals, the student MUST NOT type. 
    Instead, provide 4 options for the student to select from.
    
    - If Goal is Speaking: The task should be "Listen to the audio (in your mind or the provided prompt) and choose the correctly spelled/pronounced response from the options."
    - If Goal is Writing: "Choose the sentence with correct grammar/punctuation from the options."
    - If Goal is Vocabulary: "Choose the correct translation/meaning."
    
    You MUST provide exactly 4 distinct options in the 'options' array.
    Explanation should be soft, samimiy (Uzbek style), and encouraging.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
          isExam: { type: Type.BOOLEAN },
          examples: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: {
                original: { type: Type.STRING },
                translation: { type: Type.STRING }
              },
              required: ["original", "translation"]
            } 
          },
          task: {
            type: Type.OBJECT,
            properties: {
              taskType: { type: Type.STRING, description: "Must be 'mcq' to ensure selection-based interaction" },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              audioPrompt: { type: Type.STRING }
            },
            required: ["taskType", "question", "options"]
          }
        },
        required: ["title", "explanation", "examples", "task"]
      }
    }
  });

  const lesson = JSON.parse(response.text);
  if (isExam) lesson.isExam = true;
  return lesson;
};

export const evaluateTask = async (
  user: UserProfile, 
  lesson: LessonContent, 
  userAnswer: string
): Promise<TaskResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Evaluate student's choice for: "${lesson.task.question}".
    Selected Choice: "${userAnswer}"
    Level: ${user.currentLevel}
    Goal: ${user.goal}
    
    IMPORTANT: 
    - Set 'success' to true ONLY if they chose the correct option.
    - Give 10 coins for correct, 2 for incorrect.
    - Explain WHY it's correct or incorrect.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING },
          mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
          reason: { type: Type.STRING },
          coins: { type: Type.INTEGER },
          motivation: { type: Type.STRING },
          next_task: { type: Type.STRING },
          passedExam: { type: Type.BOOLEAN },
          success: { type: Type.BOOLEAN }
        },
        required: ["feedback", "mistakes", "reason", "coins", "motivation", "next_task", "success"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const speakText = async (text: string) => {
  if (!text) return;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (e) {
    console.error("TTS Error:", e);
  }
};
