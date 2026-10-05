'use client';

import React, { useState } from 'react';
import type { Quiz, Question, Answer } from '@/lib/types/elearning';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Award, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';

interface QuizRendererProps {
  quiz: Quiz;
  onComplete: (scorePercentage: number, isPassed: boolean, userAnswers: Record<string, string[]>) => void;
  onClose?: () => void;
}

export function QuizRenderer({ quiz, onComplete, onClose }: QuizRendererProps) {
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
        <p>Aucune question n&apos;est disponible pour cette évaluation.</p>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="mt-4">
            Fermer
          </Button>
        )}
      </div>
    );
  }

  // ÉCRAN FINAL DE RÉSULTATS
  if (isFinished) {
    return (
      <div className="bg-white rounded-2xl p-8 max-w-xl mx-auto shadow-2xl border border-slate-200 text-center animate-in zoom-in-95">
        <div className="flex justify-center mb-4">
          {isPassed ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
              <Award className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center ring-8 ring-red-50">
              <AlertCircle className="w-9 h-9" />
            </div>
          )}
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-2">
          {isPassed ? 'Félicitations ! Évaluation Réussie' : 'Évaluation Non Validée'}
        </h2>

        <p className="text-sm text-slate-600 mb-6">
          {isPassed
            ? 'Vous avez démontré une excellente maîtrise des compétences requises par Boity Studio.'
            : 'Vous n&apos;avez pas atteint le seuil minimum requis pour valider cette séquence.'}
        </p>

        {/* Score Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 mb-6 flex items-center justify-around">
          <div>
            <span className="block text-xs uppercase font-semibold text-slate-500">Votre Score</span>
            <span className={`text-3xl font-extrabold ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
              {calculatedScore}%
            </span>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <span className="block text-xs uppercase font-semibold text-slate-500">Seuil Requis</span>
            <span className="text-3xl font-extrabold text-slate-800">
              {quiz.passing_score}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Recommencer le test
          </Button>

          {onClose && (
            <Button
              variant="primary"
              onClick={onClose}
              rightIcon={<ArrowRight className="w-4 h-4" />}
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
    <div className="bg-white rounded-2xl p-6 max-w-xl mx-auto shadow-2xl border border-slate-200">
      {/* Header : Titre du Quiz et Avancement */}
      <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
            Évaluation interactive • Type 3
          </span>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1">{quiz.title}</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#EE9B00]/20 text-slate-900 border border-[#EE9B00]/40">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Intitulé de la question */}
      <div className="mb-6">
        <p className="text-base font-semibold text-slate-900 leading-snug">
          {currentQuestion.question_text}
        </p>
      </div>

      {/* Liste des choix */}
      <div className="space-y-2.5 mb-6">
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
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${optionStyle}`}
            >
              <span className="text-sm">{answer.answer_text}</span>
              {showImmediateFeedback && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {showImmediateFeedback && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explication pédagogique en cas de feedback immédiat */}
      {showImmediateFeedback && currentQuestion.explanation && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900">
          <p className="font-bold mb-1 flex items-center gap-1.5 text-[#0B4F9C]">
            <CheckCircle2 className="w-4 h-4 text-[#EE9B00]" />
            <span>Explication pédagogique Boity Studio :</span>
          </p>
          <p className="leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Footer Boutons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
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
        >
          {showImmediateFeedback
            ? currentQuestionIndex + 1 === questions.length
              ? 'Voir mon résultat'
              : 'Question suivante'
            : quiz.feedback_mode === 'immediate'
            ? 'Vérifier la réponse'
            : currentQuestionIndex + 1 === questions.length
            ? 'Terminer l&apos;évaluation'
            : 'Question suivante'}
        </Button>
      </div>
    </div>
  );
}
