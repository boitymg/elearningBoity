import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountPath = path.resolve(process.cwd(), 'elearningboity-firebase-adminsdk-fbsvc-24c83e1155.json');

  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'elearningboity',
      });
    } catch (err) {
      console.warn('[Firebase Admin] Erreur lors du chargement du fichier service account:', err);
    }
  }

  return admin.initializeApp({
    projectId: 'elearningboity',
  });
}

const adminApp = initFirebaseAdmin();
export const adminAuth = admin.auth(adminApp);
export default admin;
