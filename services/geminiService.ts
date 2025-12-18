
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, LessonContent, TaskResponse } from "../types";

// 'gemini-flash-lite-latest' modeli bepul tarifda eng yuqori limitlarga va barqarorlikka ega
const MODEL_TEXT = 'gemini-flash-lite-latest';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const generateLesson = async (user: UserProfile, isExam: boolean = false): Promise<LessonContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Sen AI English Tutorsan. Foydalanuvchi darajasi: ${user.currentLevel}, Maqsadi: ${user.goal}.
    Til: ${user.language}. Dars raqami: ${user.currentTaskIndex + 1}/5.
    
    Qoidalarni qat'iy bajar:
    1. Soft Uzbek (samimiy) tilda tushuntir.
    2. Masala faqat TEST (mcq) formatida bo'lsin.
    3. Exactly 4 ta variant (options) ber.
    4. Agar isExam bo'lsa, savollarni qiyinroq qil.
  `;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            explanation: { type: Type.STRING },
            examples: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: {
                  original: { type: Type.STRING },
                  translation: { type: Type.STRING }
                }
              } 
            },
            task: {
              type: Type.OBJECT,
              properties: {
                taskType: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                audioPrompt: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error: any) {
    throw new Error("Dars yuklashda xatolik: " + error.message);
  }
};

export const evaluateTask = async (
  user: UserProfile, 
  lesson: LessonContent, 
  userAnswer: string
): Promise<TaskResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `
    Talaba javobini tekshir: "${userAnswer}". Savol: "${lesson.task.question}".
    Javob to'g'ri bo'lsa 10 coin ber, xato bo'lsa 2 coin.
    Samimiy fikr bildir (soft Uzbek). Xato sababini chuqur tushuntir.
    Format: JSON.
  `;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [{ parts: [{ text: prompt }] }],
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
            success: { type: Type.BOOLEAN }
          }
        }
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error: any) {
    throw new Error("Tekshirishda xatolik.");
  }
};

const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const speakText = async (text: string) => {
  if (!text) return;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
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

    const audioBuffer = await decodeAudioData(
      decodeBase64(base64Audio),
      audioCtx,
      24000,
      1,
    );

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (e: any) {
    console.warn("TTS xatosi.");
  }
};
