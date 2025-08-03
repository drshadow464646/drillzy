
"use client";

import { useState, Suspense } from 'react';
import { surveyQuestions } from '@/lib/skills';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import type { SurveyAnswer } from '@/lib/types';
import { submitSurvey } from './actions';
import { useSearchParams } from 'next/navigation';

function SurveyErrorMessage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('message');

    if (!error) return null;

    return <p className="mt-4 text-sm text-destructive">{error}</p>;
}

function SurveyPageContent() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = async (answerText: string) => {
    const newAnswers: SurveyAnswer[] = [
      ...answers,
      {
        question: surveyQuestions[currentQuestionIndex].text,
        answer: answerText,
      },
    ];
    setAnswers(newAnswers);

    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsSubmitting(true);
      await submitSurvey(newAnswers);
    }
  };

  if (isSubmitting) {
    return (
      <div className="flex flex-col h-screen p-4 items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Finalizing your profile...</h1>
        <p className="text-muted-foreground mt-2">This will just take a moment.</p>
      </div>
    );
  }

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100;

  return (
    <div className="flex flex-col h-screen p-4">
      <header className="py-4">
        <Progress value={progress} className="w-full" />
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-md animate-in fade-in-50 duration-500">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            {currentQuestion.text}
          </h1>
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option.text)}
                className="h-auto py-4 text-md font-semibold whitespace-normal text-left justify-start"
                variant="outline"
                size="lg"
              >
                {option.text}
              </Button>
            ))}
          </div>
          <Suspense>
            <SurveyErrorMessage />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function SurveyPage() {
    return <SurveyPageContent />;
}
