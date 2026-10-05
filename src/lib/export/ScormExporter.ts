import JSZip from 'jszip';
import type { Formation } from '@/lib/types/elearning';
import { generateScormManifestXml } from '@/lib/scorm/ScormManifest';
import {
  generateStandaloneIndexHtml,
  SCORM_API_JS,
  PLAYER_CSS,
  PLAYER_ENGINE_JS,
} from '@/lib/scorm/ScormRuntimeTemplate';

export async function buildScormPackageZip(formation: Formation, courseDataJson: object): Promise<Blob> {
  const zip = new JSZip();

  // 1. imsmanifest.xml conforme SCORM 1.2
  zip.file('imsmanifest.xml', generateScormManifestXml(formation));

  // 2. index.html
  zip.file('index.html', generateStandaloneIndexHtml(formation.title, true));

  // 3. Runtime SCORM API
  zip.file('js/scorm-api.js', SCORM_API_JS);

  // 4. Moteur du player
  zip.file('js/player-engine.js', PLAYER_ENGINE_JS);

  // 5. CSS
  zip.file('css/player.css', PLAYER_CSS);

  // 6. Data
  zip.file(
    'data/course.json',
    `window.COURSE_DATA = ${JSON.stringify(courseDataJson, null, 2)};`
  );

  // 7. Instructions SCORM pour LMS (Section 57 Jovena)
  const readmeContent = `============================================================
BOITY STUDIO — PACKAGE SCORM 1.2 OFFICIEL (TYPE 3)
============================================================

Formation : ${formation.title}
Version   : ${formation.current_version}
Type      : SCORM 1.2 Conforme
Seuil     : ${formation.passing_score}%
Date      : ${new Date().toISOString()}

1. COMPATIBILITÉ LMS
Ce package ZIP est 100% conforme à la norme SCORM 1.2 (ADL).
Testé et compatible avec :
- Moodle
- Cornerstone
- 360Learning
- Canvas
- Totara
- Tout LMS supportant l'import d'archives SCORM 1.2

2. VARIABLES DE SUIVI TRANSMISES AU LMS
- cmi.core.lesson_status  : 'passed' (si score >= ${formation.passing_score}%), 'failed', 'completed'
- cmi.core.score.raw      : Score réel obtenu (0 à 100)
- cmi.core.score.min      : 0
- cmi.core.score.max      : 100
- cmi.core.session_time   : Durée effective passée dans la session
- cmi.suspend_data        : Reprise de progression et état de consultation

3. INSTALLATION SUR VOTRE LMS
- Ne décompressez PAS cette archive.
- Téléversez directement le fichier .zip dans la section "Ajouter une activité SCORM / Paquetage" de votre LMS.
- Définissez la note de passage à ${formation.passing_score}%.

Pour toute question d'intégration : contact@boity.mg
(c) BOITY STUDIO. Tous droits réservés.
`;

  zip.file('documentation/README.txt', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}
