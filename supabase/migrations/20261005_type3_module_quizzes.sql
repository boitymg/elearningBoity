-- ============================================================
-- MIGRATION & SEED : 5 MODULES & 16 QUESTIONS ÉVALUATION TYPE 3
-- elearning.boity — Boity Studio
-- ============================================================

DO $$
DECLARE
    v_form_id UUID := 'a0000000-0000-0000-0000-000000000001';
    
    -- Modules
    v_m1_id UUID := 'b0000000-0000-0000-0000-000000000001';
    v_m2_id UUID := 'b0000000-0000-0000-0000-000000000002';
    v_m3_id UUID := 'b0000000-0000-0000-0000-000000000003';
    v_m4_id UUID := 'b0000000-0000-0000-0000-000000000004';
    v_m5_id UUID := 'b0000000-0000-0000-0000-000000000005';
    v_m6_id UUID := 'b0000000-0000-0000-0000-000000000006';

    -- Quiz
    v_quiz1_id UUID := 'e0000000-0000-0000-0000-000000000001';
    v_quiz2_id UUID := 'e0000000-0000-0000-0000-000000000002';
    v_quiz3_id UUID := 'e0000000-0000-0000-0000-000000000003';
    v_quiz4_id UUID := 'e0000000-0000-0000-0000-000000000004';
    v_quiz5_id UUID := 'e0000000-0000-0000-0000-000000000005';
    v_quiz_final_id UUID := 'e0000000-0000-0000-0000-000000000000';
BEGIN
    -- Mettre à jour la formation en Type 3
    UPDATE public.formations
    SET title = 'Kit de Survie du Vidéaste — Prise de Vue & Cadrage Pro (Type 3)',
        type = 'TYPE_3',
        passing_score = 70,
        description = 'Formation interactive certifiante Boity Studio avec 5 modules fondamentaux et 16 questions d''évaluation conforme Jovena Type 3.'
    WHERE id = v_form_id;

END $$;
