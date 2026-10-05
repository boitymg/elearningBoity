-- ============================================================
-- SEED FORMATION OFFICIELLE BOITY STUDIO
-- ============================================================

DO $$
DECLARE
    v_formation_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_chapitre1_id UUID := 'b0000000-0000-0000-0000-000000000001';
    v_chapitre2_id UUID := 'b0000000-0000-0000-0000-000000000002';
    v_sequence1_id UUID := 'c0000000-0000-0000-0000-000000000001';
    v_sequence2_id UUID := 'c0000000-0000-0000-0000-000000000002';
    v_video1_id UUID := 'd0000000-0000-0000-0000-000000000001';
    v_quiz_id UUID := 'e0000000-0000-0000-0000-000000000001';
    v_q1_id UUID := 'f0000000-0000-0000-0000-000000000001';
    v_q2_id UUID := 'f0000000-0000-0000-0000-000000000002';
    v_q3_id UUID := 'f0000000-0000-0000-0000-000000000003';
BEGIN
    -- 1. Insérer la formation
    INSERT INTO public.formations (
        id, title, slug, description, thumbnail_url, type, status,
        duration_seconds, language, current_version, passing_score, published_at
    ) VALUES (
        v_formation_id,
        'Kit de Survie du Vidéaste — Prise de Vue & Cadrage Pro',
        'kit-de-survie-du-videaste',
        'Formation interactive officielle Boity Studio sur les techniques professionnelles de cadrage, de composition, de gestion de la lumière et d''étalonnage vidéo.',
        '/brand/logo-boity.png',
        'TYPE_3',
        'publiee',
        420,
        'fr',
        '1.0',
        70,
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        status = 'publiee';

    -- 2. Chapitres
    INSERT INTO public.chapitres (id, formation_id, title, description, order_index)
    VALUES 
        (v_chapitre1_id, v_formation_id, 'Fondamentaux & Configuration Caméra', 'Découverte du setup optique, exposition et balance des blancs.', 1),
        (v_chapitre2_id, v_formation_id, 'Éclairage & Composition Visuelle', 'Mise en place d''un setup lumière 3 points et règles de composition.', 2)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Séquences
    INSERT INTO public.sequences (id, chapitre_id, title, order_index)
    VALUES 
        (v_sequence1_id, v_chapitre1_id, '1.1 Maîtrise de l''obturation et de l''ouverture', 1),
        (v_sequence2_id, v_chapitre2_id, '2.1 Mise en place du faisceau principal et contre-jour', 1)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Vidéo
    INSERT INTO public.videos (
        id, sequence_id, title, video_url, duration_seconds, thumbnail_url
    ) VALUES (
        v_video1_id,
        v_sequence1_id,
        'Module 1 : Pratique de terrain et réglages pro',
        '/samples/formation-sample.mp4',
        180,
        '/brand/logo-boity.png'
    ) ON CONFLICT (id) DO NOTHING;

    -- 5. Interactions sur la timeline
    INSERT INTO public.interactions (
        id, video_id, type, start_time, end_time, position_x, position_y, title, content_json, action_json, is_pause_required, order_index
    ) VALUES 
        (
            gen_random_uuid(),
            v_video1_id,
            'HOTSPOT',
            5.0, 20.0,
            35.0, 45.0,
            'Point Focal & Profondeur de champ',
            '{"label": "Point focal", "text": "Une grande ouverture (ex: f/1.8) isole votre sujet avec un arrière-plan flou soigné (bokeh Boity Studio)."}'::jsonb,
            '{"type": "open_modal", "modal_body": "En vidéo professionnelle, maîtriser la profondeur de champ guide le regard de l''apprenant directement vers l''information clé."}'::jsonb,
            false,
            1
        ),
        (
            gen_random_uuid(),
            v_video1_id,
            'BUTTON',
            25.0, 45.0,
            80.0, 30.0,
            'Règle des 180°',
            '{"label": "Astuce Obturateur"}'::jsonb,
            '{"type": "open_modal", "modal_body": "N''oubliez jamais : à 25 fps, l''angle d''obturation de 180° correspond à 1/50s pour un flou de mouvement naturel et cinématique."}'::jsonb,
            false,
            2
        ),
        (
            gen_random_uuid(),
            v_video1_id,
            'QUIZ',
            60.0, 80.0,
            50.0, 50.0,
            'Évaluation Interactive Boity',
            '{"label": "Passer le Quiz"}'::jsonb,
            json_build_object('type', 'open_quiz', 'quiz_id', v_quiz_id)::jsonb,
            true, -- Pause automatique !
            3
        )
    ON CONFLICT (id) DO NOTHING;

    -- 6. Quiz et Questions
    INSERT INTO public.quiz (id, formation_id, sequence_id, title, description, passing_score, max_attempts, feedback_mode, order_index)
    VALUES (
        v_quiz_id,
        v_formation_id,
        v_sequence1_id,
        'Quiz Technique — Fondamentaux de Prise de Vue Boity',
        'Validez vos acquis sur le cadrage, l''obturation et l''éclairage pour obtenir votre attestation Boity Studio.',
        70,
        3,
        'immediate',
        1
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.questions (id, quiz_id, type, question_text, explanation, points, order_index)
    VALUES 
        (
            v_q1_id,
            v_quiz_id,
            'single_choice',
            'À une cadence de tournage de 25 images par seconde, quelle est la vitesse d''obturation idéale selon la règle des 180° ?',
            'La vitesse d''obturation doit être le double de la cadence d''images (2 x 25 = 50, soit 1/50 seconde) pour préserver un flou de mouvement réaliste.',
            10,
            1
        ),
        (
            v_q2_id,
            v_quiz_id,
            'single_choice',
            'Quel équipement est prioritaire pour adoucir une lumière dure et atténuer les ombres sur le visage d''un intervenant ?',
            'Une boîte à lumière (softbox) ou un panneau de diffusion élargit la surface émettrice, ce qui produit une lumière enveloppante et douce.',
            10,
            2
        ),
        (
            v_q3_id,
            v_quiz_id,
            'true_false',
            'La règle des tiers préconise de positionner systématiquement le sujet au centre exact de l''image.',
            'Faux. La règle des tiers suggère de placer les éléments clés sur les lignes de force ou à leurs intersections pour dynamiser la composition visuelle.',
            10,
            3
        )
    ON CONFLICT (id) DO NOTHING;

    -- 7. Réponses
    INSERT INTO public.answers (question_id, answer_text, is_correct, feedback_text, order_index)
    VALUES 
        (v_q1_id, '1/25s', false, 'Non, cela risque de créer un flou excessif.', 1),
        (v_q1_id, '1/50s', true, 'Exact ! Vitesse optimale à 25 ips pour un rendu cinématographique.', 2),
        (v_q1_id, '1/100s', false, 'Trop rapide, l''image aura un effet stroboscopique saccadé.', 3),
        (v_q1_id, '1/200s', false, 'Incorrect en vidéo standard.', 4),
        
        (v_q2_id, 'Un diffuseur ou boîte à lumière (softbox)', true, 'Bravo ! Solution idéale pour un rendu de peau impeccable.', 1),
        (v_q2_id, 'Un coupe-flux métallique (barndoor)', false, 'Le coupe-flux canalise la lumière sans l''adoucir.', 2),
        (v_q2_id, 'Une lentille de Fresnel', false, 'La lentille focalise le faisceau et le rend plus directif.', 3),

        (v_q3_id, 'Vrai', false, 'Incorrect, le cadrage plein centre est statique.', 1),
        (v_q3_id, 'Faux', true, 'Exactement ! Le placement sur les intersections apporte équilibre et dynamisme.', 2)
    ON CONFLICT (id) DO NOTHING;

END $$;
