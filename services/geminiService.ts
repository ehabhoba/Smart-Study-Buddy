import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SummaryLevel, AnalysisResult } from "../types";

// Helper to initialize AI
const getAiClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export const analyzeCurriculum = async (
  apiKey: string,
  text: string,
  summaryLevel: SummaryLevel
): Promise<AnalysisResult> => {
  
  const ai = getAiClient(apiKey);

  let summaryInstruction = "";
  switch (summaryLevel) {
    case SummaryLevel.CONCISE:
      summaryInstruction = `
        **وضع كبسولة الامتحان (Exam Capsule Mode) - الأهمية القصوى**:
        1. **قاعدة 10:1**: الهدف هو تلخيص كل 100 صفحة في حوالي 10 صفحات فقط. كثف المحتوى لأقصى درجة دون فقدان المعلومات الامتحانية.
        2. **التكويد البصري (الألوان)**: بما أن النص لا يدعم الألوان المباشرة، استخدم الرموز التالية لتمييز الفقرات بصرياً:
           - 🔴 **هام جداً / موضع سؤال امتحان**: للنقاط التي تتكرر في الاختبارات والقوانين الصارمة.
           - 🟢 **تعريف / مفهوم**: للمصطلحات والتعريفات الأساسية.
           - 💡 **فكرة ذكية**: لطرق الحل السريع أو الفهم العميق.
           - ⚠️ **تنبيه**: للأخطاء الشائعة التي يقع فيها الطلاب.
        3. **الجداول والمقارنات (هام)**: استخدم جداول Markdown بشكل مكثف للمقارنات ولعرض البيانات بشكل منظم.
        4. **الصور**: إذا كان هناك شرح يعتمد على رسم بياني أو صورة، ضع ملاحظة: [صورة توضيحية مطلوبة: وصف الصورة].
      `;
      break;
    case SummaryLevel.BALANCED:
      summaryInstruction = "تلخيص متوسط (شرح المفاهيم الأساسية). وازن بين التفاصيل والاختصار. حافظ على هيكلية الكتاب الأصلية. استخدم جداول Markdown لتنظيم المعلومات المعقدة. استخدم الرموز 🟢 و 🔵 لتوضيح العناوين.";
      break;
    case SummaryLevel.COMPREHENSIVE:
      summaryInstruction = "تلخيص شامل ودقيق. يجب تغطية كل فصل، مع الحفاظ على التنسيق الأصلي للعناوين والجداول والقوائم. هذا بديل للكتاب للدراسة.";
      break;
  }

  // Truncate logic to ensure we don't exceed limits too wildly, though 1M is generous.
  // Using 800k chars is a safe buffer.
  const processedText = text.substring(0, 800000);

  const prompt = `
    النص التالي مستخرج من كتاب دراسي (PDF). قد يحتوي على لغات متعددة (العربية، الإنجليزية، إلخ).
    
    النص:
    "${processedText}"

    أنت معلم خبير، ومصحح امتحانات، ومحلل مناهج ذكي جداً.
    استخدم قدراتك في التفكير العميق (Thinking) لتحليل هذا المحتوى بدقة متناهية.

    **🔴 تعليمات اللغة الصارمة (Strict Language Policy) - هام جداً:**
    1. **تحديد اللغة**: حدد اللغة السائدة في الكتاب فوراً.
    2. **تطابق اللغة (Language Match)**: يجب أن تكون جميع المخرجات (**الملخص**، **الأسئلة**، **البطاقات**، **الخطة**) مكتوبة **بنفس لغة الكتاب تماماً**.
       - كتاب بالإنجليزية 🇬🇧 ⬅️ ملخص وأسئلة بالإنجليزية.
       - كتاب بالعربية 🇪🇬 ⬅️ ملخص وأسئلة بالعربية.
       - كتاب فرنسي 🇫🇷 ⬅️ ملخص وأسئلة بالفرنسية.
    3. **عدم الترجمة**: لا تقم بترجمة المحتوى إلا إذا كان الكتاب نفسه ثنائي اللغة ويتطلب شرحاً.
    4. **نقل الأسئلة**: عند استخراج الأسئلة، انسخها **بنصها الأصلي ولغتها الأصلية حرفياً** (Verbatim Extraction) كما وردت في الكتاب. لا تغير صياغة السؤال.

    المهام المطلوبة:
    1. **تحليل البيانات الوصفية (Metadata Detection):**
       - حدد اللغة الأساسية للكتاب (واللغات الثانوية إن وجدت).
       - حدد المادة الدراسية بدقة.
       - خمن المرحلة الدراسية (ثانوي، جامعي، إعدادي) بناءً على تعقيد المحتوى.
       - حاول استنتاج نوع المنهج (حكومي، دولي، IGCSE، SAT، إلخ) من السياق.
       - اكتب نظرة عامة شاملة عن الكتاب (بنفس لغة الكتاب).

    2. **التلخيص الذكي (Smart Summarization):**
       - التزم بالتعليمات التالية للتلخيص بدقة: "${summaryInstruction}".
       - **هام جداً:** حافظ على تنسيق وهيكلة المعلومات كما في الكتاب الأصلي. استخدم Markdown بذكاء (العناوين H1, H2, H3، القوائم النقطية، والجداول | table | syntax |).
       - اكتب الملخص بنفس لغة الكتاب.

    3. **بنك الأسئلة الشامل (The Exam Vault):**
       - **المهمة**: استخرج **جميع** الأسئلة الموجودة في الكتاب (سواء في نهاية الفصول، أو الأسئلة الضمنية في الشرح، أو الأمثلة المحلولة).
       - إذا كان عدد الأسئلة قليلاً، قم بتوليد أسئلة إضافية تغطي كل جزء في المنهج بنمط الامتحان الرسمي لهذه المرحلة وبنفس اللغة.
       - صنف الأسئلة (اختيار من متعدد، مقالي، مسائل).
       - أرفق الإجابة النموذجية لكل سؤال (استخدم 🟢 للإجابة الصحيحة).
       - استخدم الجداول في الأسئلة إذا تطلب الأمر (مثل أسئلة التوصيل أو المقارنة).
    
    4. **بطاقات الاستذكار (Smart Flashcards):**
       - قم باستخراج أهم 10-20 مصطلح أو مفهوم أو قانون من الكتاب.
       - صغها على شكل بطاقات (الوجه: المصطلح/السؤال، الظهر: التعريف/الإجابة) بنفس لغة الكتاب.

    5. **خطة المذاكرة الذكية (Smart Study Planner):**
       - اقترح جدولاً زمنياً منطقياً لمذاكرة هذا المحتوى بالكامل (اكتب المهام بنفس لغة الكتاب).
       - قسم الجدول إلى "أيام" أو "وحدات زمنية" (مثلاً: اليوم الأول، اليوم الثاني...).
       - ضع مهام محددة لكل يوم (قراءة الفصل س، حل تمارين ص، إلخ).
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
              language: { type: Type.STRING, description: "Detected primary language of the book (e.g. Arabic, English, Mixed)" },
              subject: { type: Type.STRING, description: "The subject matter (e.g. Physics, History) in the book's language" },
              stage: { type: Type.STRING, description: "Educational stage (e.g. Grade 10, University Year 1) in the book's language" },
              curriculum: { type: Type.STRING, description: "Curriculum type (e.g. General, Cambridge, etc.) in the book's language" },
              overview: { type: Type.STRING, description: "A comprehensive overview paragraph about the book content in the book's language." }
            },
            required: ["language", "subject", "stage", "curriculum", "overview"]
          },
          summary: {
            type: Type.STRING,
            description: "Markdown formatted detailed summary in the book's language with emoji visual coding and tables."
          },
          qaBank: {
            type: Type.STRING,
            description: "Markdown formatted Q&A bank containing ALL questions from the book verbatim, using tables where appropriate, in the book's language."
          },
          flashcards: {
            type: Type.ARRAY,
            description: "A list of flashcards for active recall study in the book's language.",
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: "The term or question on the front of the card" },
                back: { type: Type.STRING, description: "The definition or answer on the back of the card" }
              }
            }
          },
          studyPlan: {
            type: Type.ARRAY,
            description: "A suggested study schedule in the book's language.",
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "Time unit (e.g. Day 1, Week 1)" },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of tasks for this time unit" }
              }
            }
          }
        },
        required: ["metadata", "summary", "qaBank", "flashcards", "studyPlan"]
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
  
  // We initialize the chat with the book context as a system instruction
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `
        أنت مساعد دراسي ذكي (Smart Study Buddy Tutor).
        لديك حق الوصول إلى محتوى الكتاب الدراسي التالي.
        
        سياق الكتاب:
        "${context.substring(0, 800000)}"
        
        مهمتك هي مساعدة الطالب في فهم هذا الكتاب.
        - تحدث مع الطالب **بنفس اللغة التي يستخدمها الطالب** في السؤال.
        - أجب فقط بناءً على المعلومات الواردة في الكتاب.
        - إذا سأل الطالب عن شيء غير موجود، أخبره بلطف أن ذلك غير مذكور في المنهج.
        - اشرح المفاهيم الصعبة بتبسيط.
        - كن مشجعاً وداعماً.
      `,
    },
  });
};

export const sendMessageToChat = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "عذراً، لم أستطع فهم ذلك.";
  } catch (error) {
    console.error("Chat Error", error);
    throw error;
  }
};