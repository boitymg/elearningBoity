// ============================================================
// SCRIPT DE SYNCHRONISATION TIMELINE VIDÉO (08:58) & QUESTIONS
// elearning.boity — Boity Studio
// ============================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://izglhqfuxtfybxocolbv.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Z2xocWZ1eHRmeWJ4b2NvbGJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTE4MTM5NiwiZXhwIjoyMTA2NzU3Mzk2fQ.2Yz1TfK-kBA_urZ7szWNEuunMyHYRG0kD9VcG3XoTcw';

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'return=minimal'
};

const FORMATION_ID = 'a0000000-0000-0000-0000-000000000001';
const VIDEO_ID = 'd0000000-0000-0000-0000-000000000001';

// Les 16 questions officielles avec leurs choix et explications
const QUESTIONS_DEF = [
  {
    num: 1,
    text: 'Lorsque l\'indicateur d\'exposition de votre caméra affiche la valeur 0, cela signifie que :',
    explanation: 'Indice d\'exposition à 0 = Exposition neutre idéale. Les ombres et les hautes lumières sont parfaitement préservées sans écrêtage.',
    points: 10,
    answers: [
      { text: 'L\'image est sous-exposée.', is_correct: false, feedback: 'Non, une valeur négative (-1, -2) indiquerait une sous-exposition.' },
      { text: 'L\'exposition est optimale (neutre), toutes les couleurs sont enregistrées.', is_correct: true, feedback: 'Exact ! La valeur 0 correspond à l\'exposition neutre recommandée par le constructeur.' },
      { text: 'Les hautes lumières sont brûlées et irrécupérables.', is_correct: false, feedback: 'Non, des hautes lumières brûlées correspondraient à une sur-exposition positive (+2 ou +3).' },
      { text: 'Le capteur est réglé sur l\'ISO natif.', is_correct: false, feedback: 'L\'indicateur mesure l\'intensité lumineuse reçue, indépendamment du fait d\'être sur l\'ISO natif ou non.' }
    ]
  },
  {
    num: 2,
    text: 'Quel outil graphique sur la caméra permet de visualiser la répartition des pixels sombres (à gauche) et clairs (à droite) ?',
    explanation: 'L\'Histogramme représente graphiquement la distribution spectrale des tonalités, des noirs purs (à gauche) aux blancs purs (à droite).',
    points: 10,
    answers: [
      { text: 'Le Zebra.', is_correct: false, feedback: 'Le Zebra affiche des hachures sur l\'image vidéo dès qu\'un seuil lumineux prédéfini (ex: 70% ou 100%) est atteint.' },
      { text: 'L\'Histogramme.', is_correct: true, feedback: 'Bravo ! L\'histogramme permet de contrôler immédiatement l\'équilibre tonal de la scène.' },
      { text: 'Le Vectorscope.', is_correct: false, feedback: 'Le Vectorscope sert à analyser la chromaticité (teinte et saturation des couleurs), notamment pour le ton chair.' },
      { text: 'Le Waveform.', is_correct: false, feedback: 'Le Waveform affiche l\'intensité lumineuse de gauche à droite en suivant la géométrie réelle de l\'image.' }
    ]
  },
  {
    num: 3,
    text: 'Si vous passez d\'une ouverture de diaphragme de f/16 à f/2.8 sur votre objectif :',
    explanation: 'f/2.8 est un nombre f plus petit mais correspond à une ouverture physique beaucoup plus grande : plus de lumière pénètre et la profondeur de champ diminue (flou d\'arrière-plan / bokeh).',
    points: 10,
    answers: [
      { text: 'Vous fermez le diaphragme et diminuez la lumière.', is_correct: false, feedback: 'Attention au piège : f/2.8 est une plus grande ouverture que f/16.' },
      { text: 'Vous ouvrez le diaphragme, laissez entrer plus de lumière et réduisez la profondeur de champ (flou d\'arrière-plan).', is_correct: true, feedback: 'Excellent ! Plus la valeur f/ est petite, plus l\'ouverture est large et la profondeur de champ courte.' },
      { text: 'Vous augmentez le bruit numérique de l\'image.', is_correct: false, feedback: 'Le bruit numérique dépend de l\'amplification du signal ISO, pas de l\'ouverture optique.' },
      { text: 'La vitesse d\'obturation est automatiquement divisée par deux.', is_correct: false, feedback: 'En mode manuel cinéma, la vitesse d\'obturation reste fixe.' }
    ]
  },
  {
    num: 4,
    text: 'Pour tourner une scène standard à 25 images par seconde (25 fps), quelle vitesse d\'obturation (shutter speed) doit-on régler par défaut pour obtenir un flou de mouvement naturel ?',
    explanation: 'Règle de l\'obturateur à 180° : la vitesse d\'obturation doit être le double de la cadence d\'images (2 x 25 = 50, soit 1/50 s) pour un rendu cinématique fluide.',
    points: 10,
    answers: [
      { text: '1/25 s.', is_correct: false, feedback: '1/25s donnerait une image trop pâteuse avec un flou de bougé excessif.' },
      { text: '1/50 s.', is_correct: true, feedback: 'Parfait ! 1/50s à 25 fps respecte scrupuleusement la règle cinématographique des 180°.' },
      { text: '1/250 s.', is_correct: false, feedback: '1/250s crée un effet saccadé très tranchant (effet stroboscopique).' },
      { text: '1/1000 s.', is_correct: false, feedback: 'Cette vitesse ultra-rapide fige le mouvement et est réservée à la photographie d\'action.' }
    ]
  },
  {
    num: 5,
    text: 'Qu\'est-ce que l\'ISO Natif d\'un capteur ?',
    explanation: 'L\'ISO Natif (ou Base ISO) est la sensibilité d\'amplification zéro du capteur où le bruit numérique est minimal et la plage dynamique maximale.',
    points: 10,
    answers: [
      { text: 'La valeur ISO minimale disponible dans les menus (ex. ISO 50).', is_correct: false, feedback: 'L\'ISO 50 est généralement une valeur étendue qui réduit la plage dynamique dans les hautes lumières.' },
      { text: 'La valeur pour laquelle le capteur offre la meilleure plage dynamique et le moins de bruit numérique.', is_correct: true, feedback: 'Exact ! C\'est le point de travail optimal pour garantir la pureté de l\'image de votre caméra.' },
      { text: 'La sensibilité automatique ajustée par la caméra en extérieur.', is_correct: false, feedback: 'L\'ISO natif est une caractéristique physique propre au capteur, pas un mode automatique.' },
      { text: 'Le niveau de grain maximal toléré au montage.', is_correct: false, feedback: 'Définition inexacte.' }
    ]
  },
  {
    num: 6,
    text: 'Quel est l\'effet d\'une focale grand-angle (ex. 16mm ou 24mm) sur l\'image ?',
    explanation: 'Une focale courte (grand-angle) élargit le champ de vision, donne une sensation de volume dans l\'espace et accentue la vitesse perçue des mouvements se rapprochant de l\'objectif.',
    points: 10,
    answers: [
      { text: 'Elle rapproche l\'arrière-plan et compresse les perspectives.', is_correct: false, feedback: 'C\'est la caractéristique propre aux longues focales / téléobjectifs (ex: 85mm ou 135mm).' },
      { text: 'Elle élargit le champ, agrandit la perception de l\'espace et accentue la vitesse des mouvements se rapprochant de la caméra.', is_correct: true, feedback: 'Bravo ! Le grand-angle dynamise les perspectives spatiales et le dynamisme des déplacements.' },
      { text: 'Elle élimine toute distorsion sur le visage en gros plan.', is_correct: false, feedback: 'Au contraire, un grand-angle en gros plan crée une distorsion en barillet accentuant le nez.' },
      { text: 'Elle nécessite obligatoirement une alimentation Phantom 48V.', is_correct: false, feedback: 'L\'alimentation 48V concerne les microphones électrostatiques, rien à voir avec les optiques.' }
    ]
  },
  {
    num: 7,
    text: 'Quelle est la particularité des optiques cinéma par rapport aux objectifs photo classiques ?',
    explanation: 'Les optiques ciné possèdent un diaphragme fluide sans crans (décliqué) gradué en T-stops (transmission réelle de lumière), des bagues dentées au pas standard 0.8 Mod pour follow-focus et un carrossage homogène.',
    points: 10,
    answers: [
      { text: 'Elles possèdent une mise au point uniquement automatique.', is_correct: false, feedback: 'Les optiques ciné sont traditionnellement manuelles avec une rotation précise à 270°-300°.' },
      { text: 'Elles disposent de bagues crantées (pour le follow focus), d\'un diaphragme fluide en T-stop sans crans, et d\'une construction standardisée.', is_correct: true, feedback: 'Exactement ! Le T-stop mesure la lumière réelle transmise et les bagues crantées permettent l\'usage d\'accessoires professionnels.' },
      { text: 'Elles sont uniquement compatibles avec les capteurs téléphones.', is_correct: false, feedback: 'Elles couvrent les grands capteurs professionnels cinéma (Super 35 et Full Frame).' },
      { text: 'Elles intègrent toujours un filtre polarisant.', is_correct: false, feedback: 'Les filtres sont insérés séparément dans la matte-box devant l\'optique.' }
    ]
  },
  {
    num: 8,
    text: 'Pour enregistrer la voix d\'un comédien avec une perche micro, comment doit-on orienter la capsule ?',
    explanation: 'Le perchage par le haut, incliné à environ 45° vers la bouche, capte la voix directement tout en utilisant le diagramme cardioïde/canon pour rejeter les bruits de pas et les résonances du sol.',
    points: 10,
    answers: [
      { text: 'À l\'horizontale, directement face à la poitrine.', is_correct: false, feedback: 'Capterait trop les bruits de frottements de vêtements et perturberait le champ de la caméra.' },
      { text: 'Par le haut, inclinée à environ 45° vers la bouche du comédien.', is_correct: true, feedback: 'Très bien ! C\'est la méthode standard sur plateau pour un timbre vocal chaleureux sans bruits parasites de sol.' },
      { text: 'Par le bas, collée contre le sol pour récupérer la réverbération.', is_correct: false, feedback: 'Le sol amplifierait tous les bruits de pas et la réverbération de la pièce.' },
      { text: 'À 90° vers le plafond pour capter l\'ambiance globale.', is_correct: false, feedback: 'Cette orientation ne capterait pas la présence directe de la voix de l\'acteur.' }
    ]
  },
  {
    num: 9,
    text: 'En enregistrement numérique, quel niveau sonore moyen (dBFS) doit-on viser pour la voix sans risque de saturation (0 dBFS) ?',
    explanation: 'En audionumérique, 0 dBFS est le seuil absolu de saturation irréversible. Un niveau nominal moyen à -18 dBFS avec des crêtes entre -12 et -24 dBFS offre une marge de sécurité (headroom) idéale.',
    points: 10,
    answers: [
      { text: '0 dBFS tout le temps.', is_correct: false, feedback: 'À 0 dBFS en numérique, le signal sature immédiatement (écrêtage numérique destructeur).' },
      { text: 'Autour de -18 dBFS (avec des crêtes entre -12 dBFS et -24 dBFS).', is_correct: true, feedback: 'Exact ! Cette marge de manœuvre (headroom) protège l\'enregistrement de tout cri ou montée de voix imprévue.' },
      { text: '-50 dBFS pour éviter les bruits de fond.', is_correct: false, feedback: 'À -50 dBFS, le signal est trop bas et génèrera un souffle important lors de la normalisation.' },
      { text: '+6 dBFS pour augmenter le volume de sortie.', is_correct: false, feedback: 'En numérique (dB Full Scale), les valeurs positives au-dessus de 0 dBFS n\'existent pas.' }
    ]
  },
  {
    num: 10,
    text: 'À quoi sert le clap de tournage sur un plateau ?',
    explanation: 'Le clap fournit un repère visuel (les informations inscrites sur l\'ardoise et le contact des barres) et un repère sonore (le transitoire net du claquement) pour la synchronisation précise en post-production.',
    points: 10,
    answers: [
      { text: 'À régler la balance des blancs automatique de la caméra.', is_correct: false, feedback: 'La balance des blancs se règle avec une charte de gris neutre ou une mire de couleurs.' },
      { text: 'À identifier la prise (scène/plan) et à fournir un repère visuel et sonore précis pour la synchronisation en post-production.', is_correct: true, feedback: 'Parfait ! Le pic audio net coïncide exactement avec la fermeture des barres pour une synchro instantanée.' },
      { text: 'À mesurer la puissance électrique consommée par les projecteurs.', is_correct: false, feedback: 'Rien à voir avec l\'électricité du plateau.' },
      { text: 'À fermer l\'objectif entre deux prises.', is_correct: false, feedback: 'Non, c\'est le bouchon d\'objectif ou le volet de protection.' }
    ]
  },
  {
    num: 11,
    text: 'Quelle est la température de couleur moyenne attribuée à la lumière du jour (Soleil) ?',
    explanation: 'La température de référence de la lumière du jour (Daylight) est standardisée à 5 600 Kelvins (blanc neutre bleuté). La lumière tungstène est à 3 200 K.',
    points: 10,
    answers: [
      { text: '1 900 K.', is_correct: false, feedback: '1 900 K correspond à la lumière orangée d\'une flamme de bougie.' },
      { text: '3 200 K.', is_correct: false, feedback: '3 200 K est la température standard des projecteurs halogène / tungstène.' },
      { text: '5 600 K.', is_correct: true, feedback: 'Exact ! 5 600 K est l\'étalon officiel de la lumière du jour en audiovisuel.' },
      { text: '7 500 K.', is_correct: false, feedback: '7 500 K correspond à un ciel ombragé ou couvert très froid.' }
    ]
  },
  {
    num: 12,
    text: 'Pour transformer un projecteur Tungstène (3200 K) en lumière du jour (5600 K), quelle gélatine devez-vous fixer dessus ?',
    explanation: 'CTB signifie "Color Temperature Blue" : cette gélatine bleue absorbe le spectre chaud du tungstène 3200K pour l\'élever à 5600K.',
    points: 10,
    answers: [
      { text: 'Une gélatine CTO (Orange).', is_correct: false, feedback: 'Le CTO (Color Temperature Orange) fait l\'inverse : il transforme une source 5600K en 3200K.' },
      { text: 'Une gélatine CTB (Bleue).', is_correct: true, feedback: 'Bravo ! Le CTB refroidit la source 3200K pour la faire correspondre à 5600K.' },
      { text: 'Une gélatine ND3 (Neutre).', is_correct: false, feedback: 'La gélatine ND atténue la puissance lumineuse sans en modifier la couleur.' },
      { text: 'Une gélatine de teinte verte (Minus Green).', is_correct: false, feedback: 'Le Minus Green corrige une dominante magenta/verte sur les tubes néon ou LED.' }
    ]
  },
  {
    num: 13,
    text: 'L\'éclairage dit "Rembrandt" se caractérise visuellement par :',
    explanation: 'L\'éclairage Rembrandt (inspiré du peintre) crée une ombre latérale douce et fait apparaître un petit triangle lumineux caractéristique sur la joue opposée à la source principale.',
    points: 10,
    answers: [
      { text: 'Une ombre totale sur la moitié du visage (éclairage latéral pur).', is_correct: false, feedback: 'C\'est l\'éclairage Split (séparé en deux).' },
      { text: 'Un petit triangle de lumière sur la joue située du côté le plus sombre du visage.', is_correct: true, feedback: 'Exactement ! Le triangle Rembrandt est l\'un des éclairages de portrait les plus élégants du cinéma.' },
      { text: 'Un liseré lumineux entourant les cheveux par l\'arrière.', is_correct: false, feedback: 'C\'est le rétro-éclairage (Backlight / Kicker).' },
      { text: 'Un visage totalement plat sans aucune ombre.', is_correct: false, feedback: 'C\'est un éclairage frontal plat (Flat lighting).' }
    ]
  },
  {
    num: 14,
    text: 'Lors de l\'incrustation sur Fond Vert, quelle précaution concernant l\'obturateur est recommandée pour éviter les bords flous gâchant l\'incrustation ?',
    explanation: 'Le flou de bougé provoque un mélange indésirable de vert dans les pixels périphériques du sujet. Monter l\'obturateur (au moins 1/100s) réduit ce flou et garantit un découpage net en compositing.',
    points: 10,
    answers: [
      { text: 'Baisser l\'obturateur à 1/25 s.', is_correct: false, feedback: 'Baisser le shutter augmenterait le flou de bougé et rendrait le détourage vert impossible.' },
      { text: 'Augmenter la vitesse d\'obturation (minimum 1/100 s) pour réduire le flou de mouvement.', is_correct: true, feedback: 'Très bien ! Moins de flou signifie des contours nets et un masque d\'incrustation ultra propre.' },
      { text: 'Laisser l\'obturateur en mode automatique.', is_correct: false, feedback: 'À proscrire absolument pour éviter tout changement intempestif de luminosité.' },
      { text: 'Éteindre complètement les projecteurs du fond.', is_correct: false, feedback: 'Le fond vert doit au contraire être baigné d\'une lumière uniforme et sans plis.' }
    ]
  },
  {
    num: 15,
    text: 'Qu\'est-ce que le Découpage Technique ?',
    explanation: 'Le découpage technique (shot list) est le document opérationnel rédigé par le réalisateur qui découpe chaque scène en plans successifs avec cadrage, axe, optique, mouvement et son.',
    points: 10,
    answers: [
      { text: 'Le logiciel de montage dans lequel on coupe les rushs.', is_correct: false, feedback: 'C\'est le banc de montage virtuel (Premiere Pro, DaVinci Resolve, Avid).' },
      { text: 'Un tableau rédigé par le réalisateur listant chaque plan à filmer avec sa valeur, son angle, son mouvement et l\'action correspondante.', is_correct: true, feedback: 'Parfait ! C\'est la partition technique qui guide l\'équipe sur le plateau plan par plan.' },
      { text: 'La liste des repas fournis par la régie sur le tournage.', is_correct: false, feedback: 'C\'est le menu régie / catering.' },
      { text: 'La facture de location du matériel caméra.', is_correct: false, feedback: 'C\'est le bon de commande de location.' }
    ]
  },
  {
    num: 16,
    text: 'Que stipule la Règle des 180° lors du tournage d\'un dialogue entre deux personnages ?',
    explanation: 'La règle des 180° définit un axe d\'action virtuel entre les deux personnages. Conserver toutes les caméras du même côté de cet axe garantit que les personnages se regardent toujours l\'un l\'autre au montage.',
    points: 10,
    answers: [
      { text: 'La caméra doit tourner à 180° autour des acteurs à chaque réplique.', is_correct: false, feedback: 'Cela briserait l\'axe spatial et inverserait la direction des regards.' },
      { text: 'Une ligne imaginaire relie les deux comédiens ; la caméra doit toujours rester du même côté de cette ligne pour préserver la cohérence des regards.', is_correct: true, feedback: 'Bravo ! Le respect de la règle des 180° est indispensable pour la continuité visuelle du dialogue.' },
      { text: 'Il faut utiliser au minimum 180 projecteurs de studio.', is_correct: false, feedback: 'Non.' },
      { text: 'Les comédiens doivent se tourner le dos toutes les 30 secondes.', is_correct: false, feedback: 'Non.' }
    ]
  }
];

// TIMELINE PRÉCISE CALÉE SUR LA TRANSCRIPTION VERBATIM (538 secondes = 08:58)
const TIMELINE_CHECKPOINTS = [
  {
    time: 90.0, // 01:30
    duration: 8.0,
    type: 'INFO',
    title: 'Les 5 Piliers du Tournage',
    posX: 50,
    posY: 25,
    is_pause: false,
    content: {
      label: '5 Piliers Clés',
      text: '1. Exposition • 2. Choix de l\'objectif • 3. Prise de son • 4. Éclairage • 5. Découpage technique.'
    }
  },
  {
    time: 134.0, // 02:14 - Fin explication Exposition & Triangle
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Indicateur d\'exposition',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0001-000000000001',
    question_nums: [1]
  },
  {
    time: 166.0, // 02:46 - Fin explication Diaphragme & Bokeh
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Diaphragme & Flou d\'arrière-plan',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0001-000000000003',
    question_nums: [3]
  },
  {
    time: 197.0, // 03:17 - Fin explication Obturateur & 180°
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Vitesse d\'obturation à 25 fps',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0001-000000000004',
    question_nums: [4]
  },
  {
    time: 223.0, // 03:43 - Fin explication ISO & Histogramme
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Histogramme & ISO Natif',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0001-000000000005',
    question_nums: [2, 5]
  },
  {
    time: 250.0, // 04:10 - Fin explication Focale Grand-Angle
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Focale Grand-Angle',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0002-000000000006',
    question_nums: [6]
  },
  {
    time: 266.0, // 04:26 - Fin explication Optiques Cinéma
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Optiques Cinéma vs Photo',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0002-000000000007',
    question_nums: [7]
  },
  {
    time: 311.0, // 05:11 - Fin explication Perchage & Capsule
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Orientation Perche Micro',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0003-000000000008',
    question_nums: [8]
  },
  {
    time: 340.0, // 05:40 - Fin explication Niveaux dBFS & Clap
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Niveaux dBFS & Synchro Clap',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0003-000000000009',
    question_nums: [9, 10]
  },
  {
    time: 380.0, // 06:20 - Fin explication 5600K, CTB & Rembrandt
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Éclairage, Rembrandt & Gélatines',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0004-000000000011',
    question_nums: [11, 12, 13]
  },
  {
    time: 411.0, // 06:51 - Fin explication Fond Vert & Obturateur
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Obturateur sur Fond Vert',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0004-000000000014',
    question_nums: [14]
  },
  {
    time: 465.0, // 07:45 - Fin explication Découpage Technique
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : Découpage Technique',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0005-000000000015',
    question_nums: [15]
  },
  {
    time: 499.0, // 08:19 - Fin explication Règle des 180°
    duration: 10.0,
    type: 'QUIZ',
    title: 'Check-in : La Règle des 180°',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0005-000000000016',
    question_nums: [16]
  },
  {
    time: 535.0, // 08:55 - Fin de la vidéo & Conclusion
    duration: 8.0,
    type: 'QUIZ',
    title: '🎓 Examen Certifiant Type 3 (16 Questions)',
    posX: 50,
    posY: 50,
    is_pause: true,
    quiz_id: 'e0000000-0000-0000-0000-000000000000',
    question_nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  }
];

async function syncTimeline() {
  console.log('🎬 Synchronisation vidéo (08:58) avec les questions interactives...');

  // 1. Mettre à jour la vidéo principale avec la durée exacte de 538 secondes
  await fetch(`${SUPABASE_URL}/rest/v1/videos?id=eq.${VIDEO_ID}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({
      duration_seconds: 538,
      title: 'Kit de Survie du Vidéaste — Décryptage Intégral (08:58)'
    })
  });

  // Mettre à jour la formation
  await fetch(`${SUPABASE_URL}/rest/v1/formations?id=eq.${FORMATION_ID}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({
      duration_seconds: 538
    })
  });

  // 2. Nettoyer les interactions existantes sur cette vidéo
  await fetch(`${SUPABASE_URL}/rest/v1/interactions?video_id=eq.${VIDEO_ID}`, {
    method: 'DELETE',
    headers: HEADERS
  });

  // 3. Créer chaque quiz checkpoint et ses interactions
  let interactionOrder = 1;
  for (const cp of TIMELINE_CHECKPOINTS) {
    console.log(`⏱️ Checkpoint à ${cp.time}s : ${cp.title}`);

    if (cp.type === 'QUIZ') {
      // Vérifier ou insérer le quiz
      await fetch(`${SUPABASE_URL}/rest/v1/quiz`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          id: cp.quiz_id,
          formation_id: FORMATION_ID,
          title: cp.title,
          description: `Question interactive synchronisée sur la vidéo à ${Math.floor(cp.time / 60)}m${String(Math.floor(cp.time % 60)).padStart(2, '0')}s`,
          passing_score: 70,
          max_attempts: 0,
          feedback_mode: cp.question_nums.length > 5 ? 'end_of_quiz' : 'immediate',
          order_index: interactionOrder
        })
      });

      // Insérer les questions rattachées si ce n'est pas le quiz final déjà peuplé
      if (cp.quiz_id !== 'e0000000-0000-0000-0000-000000000000') {
        let qOrder = 1;
        for (const num of cp.question_nums) {
          const qDef = QUESTIONS_DEF.find(q => q.num === num);
          if (!qDef) continue;

          const qId = `f0000000-${cp.quiz_id.slice(-4)}-0000-0000-${String(num).padStart(12, '0')}`;
          await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
              id: qId,
              quiz_id: cp.quiz_id,
              type: 'single_choice',
              question_text: `${qDef.num}. ${qDef.text}`,
              explanation: qDef.explanation,
              points: 10,
              order_index: qOrder++
            })
          });

          // Réponses
          let aOrder = 1;
          for (const ans of qDef.answers) {
            await fetch(`${SUPABASE_URL}/rest/v1/answers`, {
              method: 'POST',
              headers: HEADERS,
              body: JSON.stringify({
                question_id: qId,
                answer_text: ans.text,
                is_correct: ans.is_correct,
                feedback_text: ans.feedback,
                order_index: aOrder++
              })
            });
          }
        }
      }

      // Insérer l'interaction sur la timeline avec pause obligatoire
      await fetch(`${SUPABASE_URL}/rest/v1/interactions`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          video_id: VIDEO_ID,
          type: 'QUIZ',
          start_time: cp.time,
          end_time: cp.time + cp.duration,
          position_x: cp.posX,
          position_y: cp.posY,
          title: cp.title,
          content_json: { label: cp.title },
          action_json: { type: 'open_quiz', quiz_id: cp.quiz_id },
          is_pause_required: cp.is_pause,
          order_index: interactionOrder++
        })
      });
    } else if (cp.type === 'INFO') {
      // Interaction type INFO
      await fetch(`${SUPABASE_URL}/rest/v1/interactions`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          video_id: VIDEO_ID,
          type: 'HOTSPOT',
          start_time: cp.time,
          end_time: cp.time + cp.duration,
          position_x: cp.posX,
          position_y: cp.posY,
          title: cp.title,
          content_json: cp.content,
          action_json: {
            type: 'open_modal',
            modal_title: cp.title,
            modal_body: cp.content.text
          },
          is_pause_required: false,
          order_index: interactionOrder++
        })
      });
    }
  }

  console.log('✅ Synchronisation de la timeline 08:58 terminée avec succès !');
}

syncTimeline().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
