// ============================================================
// SCRIPT DE SEED OFFICIEL — FORMATION TYPE 2 (VIDÉO INTERACTIVE)
// elearning.boity — Boity Studio
// ============================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://izglhqfuxtfybxocolbv.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Z2xocWZ1eHRmeWJ4b2NvbGJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTE4MTM5NiwiZXhwIjoyMTA2NzU3Mzk2fQ.2Yz1TfK-kBA_urZ7szWNEuunMyHYRG0kD9VcG3XoTcw';

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'return=representation'
};

const FORMATION_ID = 'a0000000-0000-0000-0000-000000000002';
const VIDEO_PATH = '/videos/VIDEOtype2.mp4';
const DURATION_SECONDS = 523; // 8 minutes 43 secondes

async function seedType2Course() {
  console.log('🚀 Début du seed de la formation Type 2 avec VIDEOtype2.mp4...');

  // 1. Enregistrement du média dans media_assets
  const mediaAsset = {
    id: 'f0000000-0000-0000-0000-000000000010',
    file_name: 'VIDEOtype2.mp4',
    file_path: 'videos/VIDEOtype2.mp4',
    file_url: VIDEO_PATH,
    mime_type: 'video/mp4',
    file_size_bytes: 44455536,
    duration_seconds: DURATION_SECONDS,
  };

  const resMedia = await fetch(`${SUPABASE_URL}/rest/v1/media_assets?on_conflict=id`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(mediaAsset)
  });
  console.log('📦 Media asset indexé:', resMedia.status);

  // 2. Création / Mise à jour de la Formation Type 2
  const formationData = {
    id: FORMATION_ID,
    title: 'Prise de Vue & Réalisation Audiovisuelle — Vidéo Interactive (Type 2)',
    slug: 'realisation-audiovisuelle-video-interactive-type-2',
    description: "Module immersif Type 2 officiel Boity Studio : navigation libre par chapitres, enrichissement visuel, points d'intérêt (hotspots) et fiches repères techniques sans évaluation certificative bloquante. Optimisé pour consultation interactive et déploiement autonome.",
    thumbnail_url: '/brand/logo-boity.png',
    type: 'TYPE_2',
    status: 'publiee',
    duration_seconds: DURATION_SECONDS,
    language: 'fr',
    current_version: '1.0',
    passing_score: 70,
    published_at: new Date().toISOString()
  };

  const resForm = await fetch(`${SUPABASE_URL}/rest/v1/formations?on_conflict=id`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(formationData)
  });
  console.log('🎓 Formation Type 2 créée:', resForm.status);

  // 3. Création des chapitres
  const chapters = [
    {
      id: 'b0000000-0000-0000-0000-000000000011',
      formation_id: FORMATION_ID,
      title: 'Module 1 : Mise en place du Setup & Prise en Main',
      description: "Fondamentaux d'installation caméra, réglages optiques et manipulation de base.",
      order_index: 1
    },
    {
      id: 'b0000000-0000-0000-0000-000000000012',
      formation_id: FORMATION_ID,
      title: 'Module 2 : Cadrage Dynamique & Découpage Technique',
      description: "Règles des 180°, axes de regard, gestion de l'espace et composition de l'image.",
      order_index: 2
    },
    {
      id: 'b0000000-0000-0000-0000-000000000013',
      formation_id: FORMATION_ID,
      title: 'Module 3 : Méthodologie Terrain & Fiches Pratiques',
      description: "Synthèse des réflexes professionnels pour une captation audiovisuelle sans défaut.",
      order_index: 3
    }
  ];

  for (const chap of chapters) {
    const resChap = await fetch(`${SUPABASE_URL}/rest/v1/chapitres?on_conflict=id`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(chap)
    });
    console.log(`  📂 Chapitre ${chap.order_index} :`, resChap.status);
  }

  // 4. Création des séquences
  const sequences = [
    {
      id: 'c0000000-0000-0000-0000-000000000011',
      chapitre_id: 'b0000000-0000-0000-0000-000000000011',
      title: '1.1 Découverte du setup et manipulation caméra',
      order_index: 1
    },
    {
      id: 'c0000000-0000-0000-0000-000000000012',
      chapitre_id: 'b0000000-0000-0000-0000-000000000012',
      title: '2.1 Découpage, angles de prise de vue & 180°',
      order_index: 1
    },
    {
      id: 'c0000000-0000-0000-0000-000000000013',
      chapitre_id: 'b0000000-0000-0000-0000-000000000013',
      title: '3.1 Récapitulatif technique et mémo terrain',
      order_index: 1
    }
  ];

  for (const seq of sequences) {
    const resSeq = await fetch(`${SUPABASE_URL}/rest/v1/sequences?on_conflict=id`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(seq)
    });
    console.log(`    🎞️ Séquence ${seq.title} :`, resSeq.status);
  }

  // 5. Création des vidéos attachées (VIDEOtype2.mp4)
  const videos = [
    {
      id: 'd0000000-0000-0000-0000-000000000011',
      sequence_id: 'c0000000-0000-0000-0000-000000000011',
      title: 'Vidéo Interactive Type 2 — Partie 1 (08:43)',
      video_url: VIDEO_PATH,
      thumbnail_url: '/brand/logo-boity.png',
      duration_seconds: DURATION_SECONDS,
      mime_type: 'video/mp4',
      file_size_bytes: 44455536
    },
    {
      id: 'd0000000-0000-0000-0000-000000000012',
      sequence_id: 'c0000000-0000-0000-0000-000000000012',
      title: 'Vidéo Interactive Type 2 — Partie 2 (08:43)',
      video_url: VIDEO_PATH,
      thumbnail_url: '/brand/logo-boity.png',
      duration_seconds: DURATION_SECONDS,
      mime_type: 'video/mp4',
      file_size_bytes: 44455536
    },
    {
      id: 'd0000000-0000-0000-0000-000000000013',
      sequence_id: 'c0000000-0000-0000-0000-000000000013',
      title: 'Vidéo Interactive Type 2 — Partie 3 (08:43)',
      video_url: VIDEO_PATH,
      thumbnail_url: '/brand/logo-boity.png',
      duration_seconds: DURATION_SECONDS,
      mime_type: 'video/mp4',
      file_size_bytes: 44455536
    }
  ];

  for (const vid of videos) {
    const resVid = await fetch(`${SUPABASE_URL}/rest/v1/videos?on_conflict=id`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(vid)
    });
    console.log(`      🎥 Vidéo rattachée :`, resVid.status);
  }

  // 6. Interactions interactives in-video (Hotspots, Info, CTAs)
  const interactions = [
    {
      id: 'e0000000-0000-0000-0000-000000000011',
      video_id: 'd0000000-0000-0000-0000-000000000011',
      type: 'HOTSPOT',
      title: "Point clé : Réglage d'obturation",
      start_time: 45,
      end_time: 65,
      position_x: 65,
      position_y: 35,
      is_pause_required: false,
      content_json: {
        info_text: "Règle de l'obturateur à 180° : la vitesse d'obturation doit toujours correspondre au double de la cadence d'images (ex: 1/50s pour 25fps)."
      }
    },
    {
      id: 'e0000000-0000-0000-0000-000000000012',
      video_id: 'd0000000-0000-0000-0000-000000000011',
      type: 'INFO',
      title: 'Guide Pratique : Focales & Perspectives',
      start_time: 140,
      end_time: 160,
      position_x: 50,
      position_y: 50,
      is_pause_required: true,
      content_json: {
        info_text: "Un grand-angle (24mm) étire les perspectives et agrandit l'espace, tandis qu'un téléobjectif (85mm+) compresse les plans et détache le sujet de l'arrière-plan."
      }
    },
    {
      id: 'e0000000-0000-0000-0000-000000000013',
      video_id: 'd0000000-0000-0000-0000-000000000011',
      type: 'CTA',
      title: 'Documentation Technique Boity Studio',
      start_time: 260,
      end_time: 285,
      position_x: 75,
      position_y: 75,
      is_pause_required: false,
      content_json: {
        label: 'Consulter le mémo cadrage',
        url: '#'
      }
    }
  ];

  for (const inter of interactions) {
    const resInter = await fetch(`${SUPABASE_URL}/rest/v1/interactions?on_conflict=id`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(inter)
    });
    console.log(`        ✨ Interaction (${inter.type}) :`, resInter.status);
  }

  console.log('🎉 Seed de la Formation Type 2 terminé avec succès !');
}

seedType2Course().catch(console.error);
