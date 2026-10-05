import type { Formation } from '@/lib/types/elearning';

export function generateScormManifestXml(formation: Formation): string {
  const identifier = `BOITY_COURSE_${formation.slug.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase()}`;
  const title = formation.title.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${identifier}" version="1.2"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.imsglobal.org/xsd/imsmd_rootv1p2p2 imsmd_rootv1p2p2.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="${identifier}_ORG">
    <organization identifier="${identifier}_ORG">
      <title>${title}</title>
      <item identifier="${identifier}_ITEM" identifierref="${identifier}_RES" isvisible="true">
        <title>${title}</title>
        <adlcp:masteryscore>${formation.passing_score || 70}</adlcp:masteryscore>
        <adlcp:datafromlms></adlcp:datafromlms>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="${identifier}_RES" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="js/scorm-api.js"/>
      <file href="js/player-engine.js"/>
      <file href="css/player.css"/>
      <file href="data/course.json"/>
      <file href="assets/logo-boity.png"/>
    </resource>
  </resources>
</manifest>`;
}
