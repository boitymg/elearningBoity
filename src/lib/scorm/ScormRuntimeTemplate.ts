export const SCORM_API_JS = `/**
 * Adaptateur officiel SCORM 1.2 — BOITY STUDIO
 * Gère la communication robuste avec tout LMS conforme SCORM 1.2
 */
(function(window) {
  'use strict';

  function ScormBridge() {
    this.api = null;
    this.isInitialized = false;
    this.startTime = new Date();
  }

  // Recherche récursive de l'API SCORM dans l'arborescence des frames
  ScormBridge.prototype.findAPI = function(win) {
    var attempts = 0;
    while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
      attempts++;
      if (attempts > 10) return null;
      win = win.parent;
    }
    return win.API || null;
  };

  ScormBridge.prototype.getAPI = function() {
    if (this.api) return this.api;
    var api = this.findAPI(window);
    if (!api && window.opener) {
      api = this.findAPI(window.opener);
    }
    this.api = api;
    return api;
  };

  ScormBridge.prototype.initialize = function() {
    var api = this.getAPI();
    if (api) {
      var res = api.LMSInitialize("");
      this.isInitialized = (res === "true" || res === true);
      console.log("[Boity SCORM] Initialisé avec succès sur le LMS:", this.isInitialized);
      return this.isInitialized;
    }
    console.warn("[Boity SCORM] Mode Autonome (Aucun LMS SCORM 1.2 détecté).");
    return false;
  };

  ScormBridge.prototype.getValue = function(key) {
    var api = this.getAPI();
    if (api && this.isInitialized) {
      return api.LMSGetValue(key);
    }
    return "";
  };

  ScormBridge.prototype.setValue = function(key, val) {
    var api = this.getAPI();
    if (api && this.isInitialized) {
      var res = api.LMSSetValue(key, String(val));
      api.LMSCommit("");
      return res;
    }
    return "";
  };

  ScormBridge.prototype.formatSessionTime = function(start) {
    var now = new Date();
    var diffMs = now.getTime() - start.getTime();
    var totalSecs = Math.floor(diffMs / 1000);
    var hours = Math.floor(totalSecs / 3600);
    var mins = Math.floor((totalSecs % 3600) / 60);
    var secs = totalSecs % 60;
    return (
      (hours < 10 ? "0" : "") + hours + ":" +
      (mins < 10 ? "0" : "") + mins + ":" +
      (secs < 10 ? "0" : "") + secs
    );
  };

  ScormBridge.prototype.recordScore = function(rawScore, isPassed) {
    this.setValue("cmi.core.score.raw", rawScore);
    this.setValue("cmi.core.score.min", "0");
    this.setValue("cmi.core.score.max", "100");
    this.setValue("cmi.core.lesson_status", isPassed ? "passed" : "failed");
  };

  ScormBridge.prototype.finish = function() {
    var api = this.getAPI();
    if (api && this.isInitialized) {
      this.setValue("cmi.core.session_time", this.formatSessionTime(this.startTime));
      api.LMSFinish("");
      this.isInitialized = false;
      console.log("[Boity SCORM] Session terminée et transmise au LMS.");
    }
  };

  window.BoityScorm = new ScormBridge();
  window.addEventListener("load", function() {
    window.BoityScorm.initialize();
  });
  window.addEventListener("beforeunload", function() {
    window.BoityScorm.finish();
  });
})(window);
`;

export const PLAYER_CSS = `/* ============================================================
   FEUILLE DE STYLE PLAYER AUTONOME - BOITY STUDIO
   ============================================================ */
:root {
  --boity-primary: #EE9B00;
  --boity-primary-hover: #D97706;
  --boity-secondary: #0B4F9C;
  --background: #0f172a;
  --surface: #ffffff;
  --foreground: #ffffff;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.player-header {
  height: 56px;
  background-color: #020617;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #1e293b;
}

.brand-title {
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.5px;
}
.brand-title span { color: var(--boity-primary); }

.player-main {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.video-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  position: relative;
}

video {
  width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Interactions Overlay */
.interaction-hotspot {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--boity-primary);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(238, 155, 0, 0.5);
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

.interaction-button {
  position: absolute;
  padding: 10px 18px;
  background: var(--boity-primary);
  color: #000;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.interaction-quiz-btn {
  position: absolute;
  padding: 12px 24px;
  background: var(--boity-secondary);
  color: #fff;
  border: 2px solid #fff;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transform: translate(-50%, -50%);
  animation: bounce 1.5s infinite;
}

/* Modal interactif */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal-box {
  background: #ffffff;
  color: #0f172a;
  border-radius: 16px;
  padding: 24px;
  max-width: 520px;
  width: 100%;
}
.modal-btn {
  background: var(--boity-primary);
  color: #000;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
}
`;

export const PLAYER_ENGINE_JS = `/**
 * Moteur Player interactif autonome Boity Studio
 * Synchronisé rigoureusement sur HTML5 video.currentTime
 */
(function() {
  var video = document.getElementById("boity-video");
  var overlay = document.getElementById("interactions-overlay");
  var courseData = window.COURSE_DATA || {};
  var interactions = [];

  // Récupérer toutes les interactions du cours
  if (courseData.chapters) {
    courseData.chapters.forEach(function(chap) {
      if (chap.sequences) {
        chap.sequences.forEach(function(seq) {
          if (seq.videos) {
            seq.videos.forEach(function(vid) {
              if (vid.interactions) {
                interactions = interactions.concat(vid.interactions);
              }
            });
          }
        });
      }
    });
  }

  // Écoute de l'avancement temps réel
  video.addEventListener("timeupdate", function() {
    var currentTime = video.currentTime;
    renderInteractions(currentTime);
  });

  function renderInteractions(time) {
    overlay.innerHTML = "";
    interactions.forEach(function(inter) {
      if (time >= inter.start_time && time <= inter.end_time) {
        var el = document.createElement("div");
        el.style.left = inter.position_x + "%";
        el.style.top = inter.position_y + "%";

        if (inter.type === "HOTSPOT") {
          el.className = "interaction-hotspot";
          el.innerHTML = "?";
          el.onclick = function() {
            showInfo(inter.title || "Information", inter.action_json.modal_body || "Point pédagogique");
          };
        } else if (inter.type === "BUTTON") {
          el.className = "interaction-button";
          el.innerText = inter.content_json.label || inter.title || "Découvrir";
          el.onclick = function() {
            if (inter.action_json.type === "jump_to_time") {
              video.currentTime = inter.action_json.target_time;
            } else {
              showInfo(inter.title, inter.action_json.modal_body);
            }
          };
        } else if (inter.type === "QUIZ") {
          el.className = "interaction-quiz-btn";
          el.innerText = "Lancer le Quiz";
          el.onclick = function() {
            startQuiz();
          };
        }
        overlay.appendChild(el);
      }
    });
  }

  function showInfo(title, body) {
    video.pause();
    var modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = '<div class="modal-box">' +
      '<h3 style="color:#0B4F9C;font-size:18px;margin-bottom:12px;">' + title + '</h3>' +
      '<p style="font-size:14px;line-height:1.5;color:#334155;">' + (body || "") + '</p>' +
      '<button class="modal-btn" id="close-modal-btn">Reprendre la vidéo</button>' +
      '</div>';
    document.body.appendChild(modal);
    document.getElementById("close-modal-btn").onclick = function() {
      document.body.removeChild(modal);
      video.play();
    };
  }

  function startQuiz() {
    video.pause();
    var modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = '<div class="modal-box">' +
      '<h3 style="color:#0B4F9C;font-size:18px;margin-bottom:12px;">Évaluation Officielle Boity Studio</h3>' +
      '<p style="font-size:14px;color:#334155;margin-bottom:16px;">À 25 ips, quelle est la vitesse recommandée ?</p>' +
      '<button class="modal-btn" style="width:100%;margin-bottom:8px;" id="q-ans-1">1/25s</button>' +
      '<button class="modal-btn" style="width:100%;margin-bottom:8px;background:#0B4F9C;color:#fff;" id="q-ans-2">1/50s (Règle 180°)</button>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById("q-ans-2").onclick = function() {
      alert("Félicitations ! 100% de réussite. Validation transmise au LMS.");
      if (window.BoityScorm) {
        window.BoityScorm.recordScore(100, true);
      }
      document.body.removeChild(modal);
      video.play();
    };

    document.getElementById("q-ans-1").onclick = function() {
      alert("Réponse incorrecte. Score : 0%.");
      if (window.BoityScorm) {
        window.BoityScorm.recordScore(0, false);
      }
      document.body.removeChild(modal);
      video.play();
    };
  }
})();
`;

export function generateStandaloneIndexHtml(formationTitle: string, isScorm: boolean): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formationTitle} — Boity Studio</title>
  <link rel="stylesheet" href="css/player.css">
  ${isScorm ? '<script src="js/scorm-api.js"></script>' : ''}
</head>
<body>
  <header class="player-header">
    <div class="brand-title">elearning<span>.boity</span> &bull; Boity Studio</div>
    <div style="font-size:12px;font-weight:bold;color:#EE9B00;">${isScorm ? 'SCORM 1.2 Module' : 'HTML5 Module'}</div>
  </header>

  <main class="player-main">
    <div class="video-container">
      <video id="boity-video" src="media/video.mp4" controls playsinline></video>
      <div id="interactions-overlay"></div>
    </div>
  </main>

  <script src="data/course.json"></script>
  <script src="js/player-engine.js"></script>
</body>
</html>`;
}
