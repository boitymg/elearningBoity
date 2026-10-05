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

  function startQuiz(quizId) {
    video.pause();
    var quizzes = courseData.quizzes || (courseData.quiz ? [courseData.quiz] : []);
    var targetQuiz = null;
    if (quizId) {
      targetQuiz = quizzes.find(function(q) { return q.id === quizId; });
    }
    if (!targetQuiz) {
      targetQuiz = quizzes[0] || {
        title: "Évaluation Type 3 Boity Studio",
        passing_score: 70,
        questions: []
      };
    }

    var questions = targetQuiz.questions || [];
    if (questions.length === 0) {
      alert("Aucune question configurée pour ce module.");
      video.play();
      return;
    }

    var currentIndex = 0;
    var correctCount = 0;
    var isSubmitted = false;

    var modal = document.createElement("div");
    modal.className = "modal-overlay";
    document.body.appendChild(modal);

    function renderQuestion() {
      var q = questions[currentIndex];
      var answers = q.answers || [];
      var progressText = (currentIndex + 1) + " / " + questions.length;

      var html = '<div class="modal-box" style="max-width:580px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">' +
          '<span style="color:#0B4F9C;font-size:12px;font-weight:bold;text-transform:uppercase;">' + targetQuiz.title + '</span>' +
          '<span style="background:#EE9B00;color:#000;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px;">' + progressText + '</span>' +
        '</div>' +
        '<p style="font-size:15px;font-weight:600;color:#0f172a;margin-bottom:16px;line-height:1.4;">' + q.question_text + '</p>' +
        '<div id="answers-container" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;"></div>' +
        '<div id="explanation-container" style="display:none;background:#f0fdf4;border:1px solid #bbf7d0;padding:10px 14px;border-radius:8px;font-size:13px;color:#166534;margin-bottom:16px;"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<button id="quiz-close-btn" style="background:transparent;border:none;color:#64748b;font-size:12px;cursor:pointer;">Fermer</button>' +
          '<button id="quiz-next-btn" class="modal-btn" style="margin-top:0;display:none;">Question suivante &rarr;</button>' +
        '</div>' +
      '</div>';

      modal.innerHTML = html;

      var answersContainer = document.getElementById("answers-container");
      var explanationContainer = document.getElementById("explanation-container");
      var nextBtn = document.getElementById("quiz-next-btn");
      var closeBtn = document.getElementById("quiz-close-btn");

      closeBtn.onclick = function() {
        document.body.removeChild(modal);
        video.play();
      };

      answers.forEach(function(ans) {
        var btn = document.createElement("button");
        btn.className = "modal-btn";
        btn.style.width = "100%";
        btn.style.textAlign = "left";
        btn.style.marginTop = "0";
        btn.style.background = "#f8fafc";
        btn.style.color = "#1e293b";
        btn.style.border = "1px solid #cbd5e1";
        btn.style.borderRadius = "8px";
        btn.style.padding = "10px 14px";
        btn.innerText = ans.answer_text;

        btn.onclick = function() {
          if (isSubmitted) return;
          isSubmitted = true;

          if (ans.is_correct) {
            correctCount++;
            btn.style.background = "#dcfce7";
            btn.style.borderColor = "#22c55e";
            btn.style.color = "#14532d";
            btn.innerHTML = "&#10004; " + ans.answer_text;
          } else {
            btn.style.background = "#fee2e2";
            btn.style.borderColor = "#ef4444";
            btn.style.color = "#7f1d1d";
            btn.innerHTML = "&#10008; " + ans.answer_text;
          }

          if (q.explanation) {
            explanationContainer.style.display = "block";
            explanationContainer.innerHTML = "<strong>Explication Boity Studio :</strong> " + q.explanation;
          }

          nextBtn.style.display = "inline-block";
          if (currentIndex + 1 === questions.length) {
            nextBtn.innerText = "Voir les résultats";
          }
        };

        answersContainer.appendChild(btn);
      });

      nextBtn.onclick = function() {
        isSubmitted = false;
        if (currentIndex + 1 < questions.length) {
          currentIndex++;
          renderQuestion();
        } else {
          renderFinalScreen();
        }
      };
    }

    function renderFinalScreen() {
      var scorePercentage = Math.round((correctCount / questions.length) * 100);
      var passingScore = targetQuiz.passing_score || 70;
      var isPassed = scorePercentage >= passingScore;

      // Transmission officielle au LMS SCORM 1.2
      if (window.BoityScorm) {
        window.BoityScorm.recordScore(scorePercentage, isPassed);
      }

      var html = '<div class="modal-box" style="text-align:center;max-width:480px;">' +
        '<div style="font-size:44px;margin-bottom:8px;">' + (isPassed ? "🎓" : "⚠️") + '</div>' +
        '<h3 style="color:' + (isPassed ? "#0B4F9C" : "#dc2626") + ';font-size:20px;margin-bottom:8px;">' +
          (isPassed ? "Félicitations ! Évaluation Validée" : "Évaluation Non Validée") +
        '</h3>' +
        '<p style="font-size:14px;color:#475569;margin-bottom:20px;">' +
          (isPassed ? "Vous avez atteint les exigences requises pour ce module." : "Le seuil de validation requis est de " + passingScore + "%.") +
        '</p>' +
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;display:flex;justify-content:space-around;">' +
          '<div><div style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:bold;">Votre score</div><div style="font-size:28px;font-weight:bold;color:' + (isPassed ? "#16a34a" : "#dc2626") + ';">' + scorePercentage + '%</div></div>' +
          '<div style="width:1px;background:#cbd5e1;"></div>' +
          '<div><div style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:bold;">Seuil requis</div><div style="font-size:28px;font-weight:bold;color:#0f172a;">' + passingScore + '%</div></div>' +
        '</div>' +
        '<button class="modal-btn" id="finish-quiz-btn">Reprendre la formation</button>' +
      '</div>';

      modal.innerHTML = html;
      document.getElementById("finish-quiz-btn").onclick = function() {
        document.body.removeChild(modal);
        video.play();
      };
    }

    renderQuestion();
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
