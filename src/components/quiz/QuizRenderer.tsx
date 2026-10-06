'use client';

import React, { useState } from 'react';
import type { Quiz, Question, Answer } from '@/lib/types/elearning';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Award, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';

interface QuizRendererProps {
  quiz: Quiz;
  userName?: string;
  onComplete: (scorePercentage: number, isPassed: boolean, userAnswers: Record<string, string[]>) => void;
  onClose?: () => void;
}

export function QuizRenderer({ quiz, userName, onComplete, onClose }: QuizRendererProps) {
  const questions = quiz.questions || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Gestion du choix de réponse
  const handleSelectOption = (answerId: string) => {
    if (showImmediateFeedback || isFinished) return;

    if (currentQuestion.type === 'single_choice' || currentQuestion.type === 'true_false') {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: [answerId],
      }));
    } else {
      // Choix multiple
      const currentList = selectedAnswers[currentQuestion.id] || [];
      const updated = currentList.includes(answerId)
        ? currentList.filter((id) => id !== answerId)
        : [...currentList, answerId];
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: updated,
      }));
    }
  };

  // Validation immédiate ou question suivante
  const handleValidateOrNext = () => {
    if (!currentQuestion) return;

    if (quiz.feedback_mode === 'immediate' && !showImmediateFeedback) {
      setShowImmediateFeedback(true);
      return;
    }

    setShowImmediateFeedback(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Fin du quiz, calcul du score total
      let earnedPoints = 0;
      let totalPossiblePoints = 0;

      questions.forEach((q) => {
        totalPossiblePoints += q.points || 10;
        const userChoiceIds = selectedAnswers[q.id] || [];
        const correctAnswers = q.answers.filter((a) => a.is_correct).map((a) => a.id);

        const isExactMatch =
          userChoiceIds.length === correctAnswers.length &&
          userChoiceIds.every((id) => correctAnswers.includes(id));

        if (isExactMatch) {
          earnedPoints += q.points || 10;
        }
      });

      const percentage = totalPossiblePoints > 0
        ? Math.round((earnedPoints / totalPossiblePoints) * 100)
        : 0;
      const passed = percentage >= quiz.passing_score;

      setCalculatedScore(percentage);
      setIsPassed(passed);
      setIsFinished(true);
      onComplete(percentage, passed, selectedAnswers);
    }
  };

  // Réinitialiser le quiz pour une nouvelle tentative
  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowImmediateFeedback(false);
    setIsFinished(false);
  };

  if (!questions.length) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-slate-600">
        <p>{"Aucune question n'est disponible pour cette évaluation."}</p>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="mt-4">
            Fermer
          </Button>
        )}
      </div>
    );
  }

  // ÉCRAN FINAL DE RÉSULTATS AVEC NOM DE L'UTILISATEUR ET FÉLICITATIONS
  if (isFinished) {
    const formattedName = userName ? userName.trim() : '';

    return (
      <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-xl mx-auto shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-center mb-4">
          {isPassed ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50 shadow-inner">
              <Award className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center ring-8 ring-red-50 shadow-inner">
              <AlertCircle className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
          )}
        </div>

        {isPassed && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Module validé avec succès</span>
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          {isPassed
            ? formattedName
              ? `Félicitations ${formattedName} ! 🎉`
              : 'Félicitations ! Évaluation Réussie 🎉'
            : formattedName
            ? `Continuez vos efforts, ${formattedName} !`
            : 'Évaluation Non Validée'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-md mx-auto">
          {isPassed
            ? formattedName
              ? `Bravo ${formattedName}, vous avez démontré une excellente maîtrise des compétences Boity Studio sur cette séquence.`
              : 'Vous avez démontré une excellente maîtrise des compétences requises par Boity Studio.'
            : formattedName
            ? `${formattedName}, vous n'avez pas encore atteint le seuil requis (${quiz.passing_score}%). Révisez la vidéo et repassez le quiz !`
            : `Vous n'avez pas atteint le seuil minimum requis de ${quiz.passing_score}% pour valider cette séquence.`}
        </p>

        {/* Score Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5 mb-6 flex items-center justify-around">
          <div>
            <span className="block text-[11px] sm:text-xs uppercase font-semibold text-slate-500">Votre Score</span>
            <span className={`text-2xl sm:text-3xl font-extrabold ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
              {calculatedScore}%
            </span>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <span className="block text-[11px] sm:text-xs uppercase font-semibold text-slate-500">Seuil Requis</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {quiz.passing_score}%
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={handleRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Recommencer le test
          </Button>

          {onClose && (
            <Button
              variant="primary"
              onClick={onClose}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Poursuivre la formation
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ÉCRAN DE QUESTION EN COURS
  const currentAnswers = currentQuestion.answers || [];
  const chosenList = selectedAnswers[currentQuestion.id] || [];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-xl mx-auto shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto flex flex-col">
      {/* Header : Titre du Quiz et Avancement */}
      <div className="pb-3 sm:pb-4 mb-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
            Évaluation interactive • Type 3
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{quiz.title}</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#EE9B00]/20 text-slate-900 border border-[#EE9B00]/40 shrink-0">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Intitulé de la question */}
      <div className="mb-4 sm:mb-6">
        <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
          {currentQuestion.question_text}
        </p>
      </div>

      {/* Liste des choix */}
      <div className="space-y-2 sm:space-y-2.5 mb-5 flex-1">
        {currentAnswers.map((answer) => {
          const isSelected = chosenList.includes(answer.id);
          const isCorrect = answer.is_correct;

          let optionStyle =
            'border-slate-200 bg-white hover:border-[#EE9B00] hover:bg-amber-50/40 text-slate-800';

          if (showImmediateFeedback) {
            if (isCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-red-500 bg-red-50 text-red-950';
            }
          } else if (isSelected) {
            optionStyle = 'border-[#EE9B00] bg-amber-50 text-slate-950 font-semibold ring-2 ring-[#EE9B00]/40';
          }

          return (
            <button
              key={answer.id}
              onClick={() => handleSelectOption(answer.id)}
              disabled={showImmediateFeedback}
              className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${optionStyle}`}
            >
              <span className="text-xs sm:text-sm">{answer.answer_text}</span>
              {showImmediateFeedback && isCorrect && (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
              )}
              {showImmediateFeedback && isSelected && !isCorrect && (
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explication pédagogique en cas de feedback immédiat */}
      {showImmediateFeedback && currentQuestion.explanation && (
        <div className="mb-5 p-3 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900">
          <p className="font-bold mb-1 flex items-center gap-1.5 text-[#0B4F9C]">
            <CheckCircle2 className="w-4 h-4 text-[#EE9B00] shrink-0" />
            <span>Explication pédagogique Boity Studio :</span>
          </p>
          <p className="leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Footer Boutons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 sm:pt-4 border-t border-slate-100 mt-auto">
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Quitter le test
          </Button>
        ) : (
          <span />
        )}

        <Button
          variant="primary"
          onClick={handleValidateOrNext}
          disabled={chosenList.length === 0}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          {showImmediateFeedback
            ? currentQuestionIndex + 1 === questions.length
              ? 'Voir mon résultat'
              : 'Question suivante'
            : quiz.feedback_mode === 'immediate'
            ? 'Vérifier la réponse'
            : currentQuestionIndex + 1 === questions.length
            ? "Terminer l'évaluation"
            : 'Question suivante'}
        </Button>
      </div>
    </div>
  );
}
