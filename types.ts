export enum SummaryLevel {
  CONCISE = 'concise',
  BALANCED = 'balanced',
  COMPREHENSIVE = 'comprehensive',
}

export type Language = 'ar' | 'en';
export type OutputLanguage = 'original' | 'ar' | 'en' | 'mixed';

export interface BookMetadata {
  language: string;
  subject: string;
  stage: string;
  curriculum: string;
  overview: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyItem {
  day: string;
  tasks: string[];
}

export interface AnalysisResult {
  metadata: BookMetadata;
  summary: string;
  qaBank: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  studyPlan: StudyItem[];
}

export enum AppStatus {
  IDLE = 'idle',
  READING = 'reading', // Extracting text from PDF
  READY = 'ready', // Text extracted, waiting for user to start AI
  PROCESSING = 'processing', // Waiting for Gemini
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface PdfExtractResult {
  text: string;
  pageCount: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingSources?: {
    title: string;
    url: string;
  }[];
}