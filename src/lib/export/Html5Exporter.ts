import JSZip from 'jszip';
import type { Formation } from '@/lib/types/elearning';
import {
  generateStandaloneIndexHtml,
  PLAYER_CSS,
  PLAYER_ENGINE_JS,
} from '@/lib/scorm/ScormRuntimeTemplate';

export async function buildHtml5PackageZip(formation: Formation, courseDataJson: object): Promise<Blob> {
  const zip = new JSZip();

  // 1. index.html
  zip.file('index.html', generateStandaloneIndexHtml(formation.title, false));

  // 2. CSS
  zip.file('css/player.css', PLAYER_CSS);

  // 3. JS
  zip.file('js/player-engine.js', PLAYER_ENGINE_JS);

  // 4. Data
  zip.file(
    'data/course.json',
    `window.COURSE_DATA = ${JSON.stringify(courseDataJson, null, 2)};`
  );

  // 5. Documentation technique (Section 57 & 58 Jovena)
  const readmeContent = `============================================================
BOITY STUDIO — PACKAGE HTML5 AUTONOME (TYPE 2 / TYPE 3)
============================================================

Formation : ${formation.title}
Version   : ${formation.current_version}
Type      : ${formation.type}
Date      : ${new Date().toISOString()}

1. PRÉSENTATION
Ce module interactif a été conçu et exporté par la plateforme
elearning.boity de BOITY STUDIO.
Il est entièrement autonome et ne nécessite aucune connexion internet
ni dépendance externe.

2. DÉPLOIEMENT SUR SERVEUR INTERNE (Exemple JOVENA)
- Décompressez le contenu de ce dossier sur votre serveur web interne
  (Apache, Nginx, IIS ou serveur intranet Jovena).
- Exemple d'URL : https://serveur-interne.jovena.mg/formations/${formation.slug}/
- Assurez-vous que le fichier index.html est la page par défaut.
- Placez vos fichiers vidéos MP4 dans le sous-dossier "media/".

3. COMPATIBILITÉ NAVIGATEURS
- Google Chrome (Recommandé)
- Mozilla Firefox
- Microsoft Edge
- Apple Safari (Desktop & Mobile)

Pour toute assistance technique : contact@boity.mg
(c) BOITY STUDIO. Tous droits réservés.
`;

  zip.file('documentation/README.txt', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}
