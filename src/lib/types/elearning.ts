// ============================================================
// TYPES OFFICIELS elearning.boity (BOITY STUDIO)
// ============================================================

export type UserRole = 'ADMIN' | 'PRODUCTEUR' | 'APPRENANT';
export type UserStatus = 'actif' | 'suspendu' | 'inactif';

export interface UserProfile {
  id: string; // Firebase UID
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string | null;
}

export type FormationType = 'TYPE_2' | 'TYPE_3'; // Type 2: sans éval | Type 3: avec éval
export type FormationStatus = 'brouillon' | 'en_revision' | 'validee' | 'publiee' | 'archivee';

export interface Formation {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  type: FormationType;
  status: FormationStatus;
  duration_seconds: number;
  language: string;
  current_version: string;
  passing_score: number; // % minimum requis (ex: 70)
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  chapitres?: Chapitre[];
}

export interface FormationVersion {
  id: string;
  formation_id: string;
  version_number: string;
  snapshot_json: Record<string, unknown>;
  notes?: string | null;
  published_by?: string | null;
  published_at: string;
}

export interface Chapitre {
  id: string;
  formation_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  created_at: string;
  sequences?: Sequence[];
}

export interface Sequence {
  id: string;
  chapitre_id: string;
  title: string;
  order_index: number;
  created_at: string;
  videos?: Video[];
  quiz?: Quiz[];
}

export interface Video {
  id: string;
  sequence_id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string | null;
  duration_seconds: number;
  mime_type?: string;
  file_size_bytes?: number;
  interactions?: Interaction[];
}

export type InteractionType =
  | 'BUTTON'
  | 'HOTSPOT'
  | 'TEXT'
  | 'IMAGE'
  | 'CHAPTER'
  | 'MENU'
  | 'CHOICE'
  | 'QUIZ'
  | 'INFO'
  | 'CTA';

export interface InteractionAction {
  type: 'jump_to_time' | 'open_url' | 'open_modal' | 'open_quiz' | 'next_sequence';
  target_time?: number;
  target_url?: string;
  modal_title?: string;
  modal_body?: string;
  quiz_id?: string;
}

export interface Interaction {
  id: string;
  video_id: string;
  type: InteractionType;
  start_time: number; // en secondes
  end_time: number;   // en secondes
  position_x: number; // % horizontal (0 - 100)
  position_y: number; // % vertical (0 - 100)
  width?: number;     // % optionnel
  height?: number;    // % optionnel
  title?: string;
  content_json: {
    label?: string;
    text?: string;
    image_url?: string;
    badge?: string;
    theme?: 'orange' | 'blue' | 'light' | 'dark';
    choices?: Array<{ id: string; label: string; action: InteractionAction }>;
  };
  action_json: InteractionAction;
  is_pause_required: boolean;
  order_index: number;
}

export interface Quiz {
  id: string;
  formation_id: string;
  sequence_id?: string | null;
  title: string;
  description?: string | null;
  passing_score: number;
  max_attempts: number; // 0 = illimité
  feedback_mode: 'immediate' | 'end_of_quiz';
  order_index: number;
  questions?: Question[];
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  feedback_text?: string | null;
  order_index: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: QuestionType;
  question_text: string;
  explanation?: string | null;
  points: number;
  order_index: number;
  answers: Answer[];
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  formation_id: string;
  formation_version: string;
  score_percentage: number;
  is_passed: boolean;
  duration_seconds: number;
  answers_json: Record<string, unknown>;
  completed_at: string;
}

export interface LearnerProgress {
  id: string;
  user_id: string;
  formation_id: string;
  current_chapitre_id?: string | null;
  current_sequence_id?: string | null;
  current_video_time: number;
  completion_percentage: number;
  is_completed: boolean;
  completed_at?: string | null;
  last_accessed_at: string;
}

export type ExportType = 'HTML5' | 'SCORM_1_2';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportRecord {
  id: string;
  formation_id: string;
  version: string;
  type: ExportType;
  status: ExportStatus;
  file_path?: string | null;
  file_url?: string | null;
  file_size_bytes?: number | null;
  error_message?: string | null;
  created_by?: string | null;
  created_at: string;
  completed_at?: string | null;
}
