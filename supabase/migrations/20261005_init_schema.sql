-- ============================================================
-- SCHÉMA OFFICIEL elearning.boity (BOITY STUDIO)
-- PostgreSQL 17 / Supabase
-- ============================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILS UTILISATEURS (Synchronisés avec Firebase UID)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Firebase Auth UID
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'APPRENANT' CHECK (role IN ('ADMIN', 'PRODUCTEUR', 'APPRENANT')),
    status TEXT NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'suspendu', 'inactif')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_sign_in_at TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- 2. FORMATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    type TEXT NOT NULL DEFAULT 'TYPE_2' CHECK (type IN ('TYPE_2', 'TYPE_3')),
    status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'en_revision', 'validee', 'publiee', 'archivee')),
    duration_seconds INTEGER DEFAULT 0,
    language TEXT DEFAULT 'fr',
    current_version TEXT NOT NULL DEFAULT '1.0',
    passing_score INTEGER DEFAULT 70, -- % minimum pour Type 3
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    published_at TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- 3. VERSIONS DE FORMATION (Versionnage immuable)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.formation_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL, -- ex: "1.0", "1.1", "2.0"
    snapshot_json JSONB NOT NULL, -- Copie intégrale immuable de l'arbre
    notes TEXT,
    published_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(formation_id, version_number)
);

-- ------------------------------------------------------------
-- 4. CHAPITRES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapitres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 5. SÉQUENCES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapitre_id UUID NOT NULL REFERENCES public.chapitres(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 6. VIDÉOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES public.sequences(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds NUMERIC(10, 2) NOT NULL DEFAULT 0,
    mime_type TEXT DEFAULT 'video/mp4',
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 7. MÉDIATHÈQUE (media_assets)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    duration_seconds NUMERIC(10, 2),
    thumbnail_url TEXT,
    uploaded_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 8. INTERACTIONS SUR TIMELINE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('BUTTON', 'HOTSPOT', 'TEXT', 'IMAGE', 'CHAPTER', 'MENU', 'CHOICE', 'QUIZ', 'INFO', 'CTA')),
    start_time NUMERIC(10, 2) NOT NULL DEFAULT 0,
    end_time NUMERIC(10, 2) NOT NULL DEFAULT 5,
    position_x NUMERIC(5, 2) DEFAULT 50, -- % horizontal
    position_y NUMERIC(5, 2) DEFAULT 50, -- % vertical
    width NUMERIC(5, 2),
    height NUMERIC(5, 2),
    title TEXT,
    content_json JSONB DEFAULT '{}'::jsonb, -- texte, image, style, etc.
    action_json JSONB DEFAULT '{}'::jsonb,  -- saut temporel, modal, url, quiz
    is_pause_required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 9. QUIZ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES public.sequences(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 70, -- % réussite
    max_attempts INTEGER DEFAULT 0, -- 0 = illimité
    feedback_mode TEXT DEFAULT 'immediate' CHECK (feedback_mode IN ('immediate', 'end_of_quiz')),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 10. QUESTIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'single_choice' CHECK (type IN ('single_choice', 'multiple_choice', 'true_false')),
    question_text TEXT NOT NULL,
    explanation TEXT,
    points INTEGER NOT NULL DEFAULT 10,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 11. RÉPONSES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    feedback_text TEXT,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- 12. TENTATIVES DE QUIZ (quiz_attempts)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    formation_version TEXT NOT NULL DEFAULT '1.0',
    score_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    is_passed BOOLEAN NOT NULL DEFAULT false,
    duration_seconds INTEGER DEFAULT 0,
    answers_json JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 13. PROGRESSION APPRENANT (learner_progress)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learner_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    current_chapitre_id UUID REFERENCES public.chapitres(id) ON DELETE SET NULL,
    current_sequence_id UUID REFERENCES public.sequences(id) ON DELETE SET NULL,
    current_video_time NUMERIC(10, 2) DEFAULT 0,
    completion_percentage NUMERIC(5, 2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, formation_id)
);

-- ------------------------------------------------------------
-- 14. SESSIONS APPRENANT (learner_sessions)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learner_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    session_end TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0
);

-- ------------------------------------------------------------
-- 15. CERTIFICATS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    certificate_code TEXT UNIQUE NOT NULL,
    final_score NUMERIC(5, 2) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    pdf_url TEXT
);

-- ------------------------------------------------------------
-- 16. EXPORTS & EXPORT JOBS (HTML5 et SCORM 1.2)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('HTML5', 'SCORM_1_2')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path TEXT,
    file_url TEXT,
    file_size_bytes BIGINT,
    error_message TEXT,
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.scorm_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_id UUID NOT NULL REFERENCES public.exports(id) ON DELETE CASCADE,
    manifest_xml TEXT NOT NULL,
    schema_version TEXT DEFAULT '1.2',
    package_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 17. AUDIT LOGS (Traçabilité complète)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 18. SETTINGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_chapitres_formation ON public.chapitres(formation_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sequences_chapitre ON public.sequences(chapitre_id, order_index);
CREATE INDEX IF NOT EXISTS idx_videos_sequence ON public.videos(sequence_id);
CREATE INDEX IF NOT EXISTS idx_interactions_video ON public.interactions(video_id, start_time);
CREATE INDEX IF NOT EXISTS idx_quiz_formation ON public.quiz(formation_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON public.questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_learner_progress_user ON public.learner_progress(user_id, formation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);

-- Insertion de la configuration Boity Studio par défaut
INSERT INTO public.settings (key, value)
VALUES 
    ('platform', '{"name": "elearning.boity", "company": "BOITY STUDIO", "support_email": "contact@boity.mg", "version": "1.0.0"}'::jsonb),
    ('scorm_default', '{"schema_version": "1.2", "mastery_score": 70, "allow_review": true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
