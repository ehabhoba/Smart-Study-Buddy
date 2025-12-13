import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SummaryLevel, AnalysisResult, OutputLanguage } from "../types";

// Helper to initialize AI
const getAiClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export const analyzeCurriculum = async (
  apiKey: string,
  text: string,
  summaryLevel: SummaryLevel,
  outputLanguage: OutputLanguage
): Promise<AnalysisResult> => {
  
  const ai = getAiClient(apiKey);

  let summaryInstruction = "";
  switch (summaryLevel) {
    case SummaryLevel.CONCISE:
      summaryInstruction = `
        **وضع كبسولة الامتحان (Exam Capsule Mode) - الأهمية القصوى**:
        1. **قاعدة 10:1**: الهدف هو تلخيص كل 100 صفحة في حوالي 10 صفحات فقط. كثف المحتوى لأقصى درجة دون فقدان المعلومات الامتحانية.
        2. **التكويد البصري (Visual Coding)**: استخدم مقتبسات Markdown (Blockquotes >) مع الرموز التالية لإنشاء صناديق ملونة:
           - > 🔴 **هام جداً / موضع سؤال امتحان**: للنقاط التي تتكرر في الاختبارات والقوانين الصارمة.
           - > 🟢 **تعريف / إجابة نموذجية**: للمصطلحات، التعريفات، والإجابات الصحيحة.
           - > 💡 **فكرة ذكية / تبسيط**: لطرق الحل السريع أو الفهم العميق.
           - > ⚠️ **تنبيه / خطأ شائع**: للأخطاء الشائعة التي يقع فيها الطلاب.
        3. **الجداول والمقارنات (هام)**: استخدم جداول Markdown بشكل مكثف للمقارنات ولعرض البيانات بشكل منظم.
        4. **الصور**: إذا كان هناك شرح يعتمد على رسم بياني أو صورة، ضع ملاحظة: [صورة توضيحية مطلوبة: وصف الصورة].
      `;
      break;
    case SummaryLevel.BALANCED:
      summaryInstruction = "تلخيص متوسط (شرح المفاهيم الأساسية). وازن بين التفاصيل والاختصار. حافظ على هيكلية الكتاب الأصلية. استخدم جداول Markdown لتنظيم المعلومات المعقدة. استخدم > 🟢 للتعريفات و > 🔵 للعناوين الفرعية.";
      break;
    case SummaryLevel.COMPREHENSIVE:
      summaryInstruction = "تلخيص شامل ودقيق. يجب تغطية كل فصل، مع الحفاظ على التنسيق الأصلي للعناوين والجداول والقوائم. هذا بديل للكتاب للدراسة.";
      break;
  }

  // Define language instruction based on user choice
  let languageInstruction = "";
  if (outputLanguage === 'ar') {
    languageInstruction = `
      **Output Language Policy (FORCED ARABIC):**
      - **CRITICAL**: The user has explicitly requested the summary, Q&A, and study plan to be in **ARABIC**.
      - Even if the input text is English or French, you MUST translate and summarize into professional Academic Arabic.
      - **Scientific Terms**: When translating scientific terms, keep the original English term in parentheses upon first mention. e.g. "التسارع (Acceleration)".
    `;
  } else if (outputLanguage === 'en') {
    languageInstruction = `
      **Output Language Policy (FORCED ENGLISH):**
      - **CRITICAL**: The user has explicitly requested the summary, Q&A, and study plan to be in **ENGLISH**.
      - Even if the input text is Arabic, you MUST translate and summarize into professional English.
    `;
  } else if (outputLanguage === 'mixed') {
    languageInstruction = `
      **Output Language Policy (PROFESSIONAL MIXED ARABIC/ENGLISH):**
      - **Target Style**: Professional Academic Mixed (Scientific Style - Common in Arab Universities/International Schools).
      - **Rule**: Write the explanations, sentence structure, and connecting text in **Arabic**.
      - **Exception**: Strictly preserve ALL **Technical Terms**, **Laws**, **Equations**, **Variables**, and **Keywords** in **English**.
      - **Format**: Use the format: "المصطلح بالإنجليزية (Arabic Translation if needed)" or just "Arabic explanation containing English Term".
      - **Example**: "إن الـ Mitochondria هي مصنع الطاقة في الخلية وتنتج الـ ATP."
      - **Q&A/Flashcards**: 
        - Flashcard Front: English Term / Question.
        - Flashcard Back: Mixed Language Answer (Arabic explanation with English terms).
    `;
  } else {
    languageInstruction = `
      **Output Language Policy (SAME AS BOOK - AUTO):**
      1. **Language Detection**: Detect the primary language of the book accurately.
         - If Arabic -> Output Arabic.
         - If English -> Output English.
         - **Mixed Content**: If the book is "Mixed" (e.g. Science in English for Arabs), preserve the specific mix of English terminology and Arabic explanation used in the book. Do not fully translate if the book itself doesn't.
    `;
  }

  // Truncate logic to ensure we don't exceed network payload limits.
  // 300,000 characters is approx 75k tokens, which is a safe limit for client-side XHR requests.
  const processedText = text.substring(0, 300000);

  const prompt = `
    The following text is extracted from a textbook (PDF).
    
    Text:
    "${processedText}"

    You are an expert tutor, exam grader, and intelligent curriculum analyst.
    Use your Thinking capabilities to analyze this content deeply.

    **${languageInstruction}**

    **Style Mimicry:**
    - If the book's style is dry/academic, simplify it for the student but maintain accuracy.
    - If it uses bullet points, use bullet points.
    - **Question Extraction**: When extracting questions from the text, preserve them verbatim but ensure they match the requested Output Language.

    Tasks:
    1. **Metadata Analysis:**
       - Detect Subject, Stage, Curriculum in the **Output Language**.
       - Write a comprehensive Overview in the **Output Language**.

    2. **Colorful Smart Summary:**
       - Follow instructions: "${summaryInstruction}".
       - **Formatting**: Use H2, H3 for structure.
       - **Visual Boxes**: Use (>) before emojis (🔴, 🟢, 💡, ⚠️).

    3. **Exam Vault (Q&A):**
       - Extract ALL questions (end of chapter, implicit, examples).
       - **Answers**: Provide standard answers inside green blockquotes (> 🟢 Answer: ...).
       - Translate questions if necessary to match the Output Language.
    
    4. **Smart Flashcards:**
       - Front: Term/Question (Output Language).
       - Back: Definition/Answer (Output Language).
    
    5. **Interactive Quiz (Multiple Choice):**
       - Generate at least 10-15 high-quality multiple choice questions.
       - Provide 4 options per question.
       - Indicate the correct answer index.
       - Provide a short educational explanation for the correct answer.

    6. **Smart Study Planner:**
       - Logical schedule in the **Output Language**.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      // Enable thinking for deeper analysis of curriculum structure and mixed languages
      thinkingConfig: { thinkingBudget: 10240 }, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING, description: "Detected primary language of the book" },
              subject: { type: Type.STRING, description: "The subject matter in Output Language" },
              stage: { type: Type.STRING, description: "Educational stage in Output Language" },
              curriculum: { type: Type.STRING, description: "Curriculum type in Output Language" },
              overview: { type: Type.STRING, description: "Overview paragraph in Output Language" }
            },
            required: ["language", "subject", "stage", "curriculum", "overview"]
          },
          summary: {
            type: Type.STRING,
            description: "Markdown summary in Output Language using blockquotes (>) for colored boxes."
          },
          qaBank: {
            type: Type.STRING,
            description: "Markdown Q&A bank in Output Language."
          },
          flashcards: {
            type: Type.ARRAY,
            description: "Flashcards in Output Language.",
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: "Front text" },
                back: { type: Type.STRING, description: "Back text" }
              }
            }
          },
          quiz: {
            type: Type.ARRAY,
            description: "Interactive Multiple Choice Quiz",
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.NUMBER, description: "Index of the correct option (0-3)" },
                explanation: { type: Type.STRING, description: "Why is this correct?" }
              }
            }
          },
          studyPlan: {
            type: Type.ARRAY,
            description: "Study schedule in Output Language.",
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "Time unit" },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tasks" }
              }
            }
          }
        },
        required: ["metadata", "summary", "qaBank", "flashcards", "quiz", "studyPlan"]
      }
    }
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("No response from Gemini");
  }

  try {
    const jsonResult = JSON.parse(resultText) as AnalysisResult;
    return jsonResult;
  } catch (e) {
    console.error("Failed to parse JSON response", e);
    throw new Error("Received invalid JSON from AI model.");
  }
};

// --- Chat Functionality ---

let chatSession: Chat | null = null;

export const initChatSession = (apiKey: string, context: string) => {
  const ai = getAiClient(apiKey);
  
  // Truncate context for chat
  const safeContext = context.substring(0, 300000);

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash', // Google Search is best supported on Pro/Flash
    config: {
      // Enable Google Search Tool for grounding
      tools: [{ googleSearch: {} }],
      systemInstruction: `
        You are Smart Study Buddy Tutor & Researcher.
        Context from Book: "${safeContext}"
        
        Task: Help the student understand this book and expand their knowledge using Google Search.
        - **Search Entity**: You are an intelligent entity capable of accessing Google Search to find real-time examples, images, or updated facts.
        - **Language Rule**: Adapt to the user's language.
        - **Grounding**: When you use the Search Tool, always reference the links found.
        - Answer strictly based on the provided context OR the search results.
        - Be supportive and clear.
      `,
    },
  });
};

export const sendMessageToChat = async (message: string): Promise<{ text: string, sources?: { title: string, url: string }[] }> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({ message });
    
    // Extract Grounding Metadata (Search Results)
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: { title: string, url: string }[] = [];
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || "Source",
            url: chunk.web.uri
          });
        }
      });
    }

    return { 
      text: result.text || "Sorry, I couldn't understand that.",
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    console.error("Chat Error", error);
    throw error;
  }
};