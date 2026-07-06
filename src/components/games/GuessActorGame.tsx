"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ACTOR_QUESTIONS, GUESS_TIME_SECONDS, calculateScore } from "@/lib/game-data/actors";
import { ActorSmileImage } from "@/components/games/ActorSmileImage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatBox } from "@/components/ui/StatBox";
import { GameStartCard, GameResultCard } from "@/components/ui/GameScreen";
import { FadeIn, Stagger } from "@/components/ui/Animated";
import { formatTime } from "@/lib/utils";

export function GuessActorGame() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(GUESS_TIME_SECONDS);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;

  const handleSubmit = useCallback(async (elapsedOverride?: number) => {
    if (submittedRef.current) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = elapsedOverride ?? GUESS_TIME_SECONDS - timeLeft;
    const finalScore = calculateScore(answers);
    setScore(finalScore);
    setSubmitting(true);

    try {
      await fetch("/api/games/guess-actor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTakenSeconds: timeTaken }),
      });
    } finally {
      setSubmitting(false);
    }
  }, [answers, timeLeft]);

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  useEffect(() => {
    if (!started || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitRef.current(GUESS_TIME_SECONDS);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, submitted]);

  if (!started) {
    return (
      <GameStartCard
        emoji="🎬"
        title="The Greatest Show"
        subtitle="Guess The Star!"
        description={`Identify Bollywood actors from their smiles. You have ${GUESS_TIME_SECONDS / 60} minutes to guess all 9 stars.`}
        onStart={() => setStarted(true)}
      />
    );
  }

  if (submitted) {
    const isWinner = score === ACTOR_QUESTIONS.length;
    return (
      <GameResultCard
        emoji={isWinner ? "🏆" : "⭐"}
        title={isWinner ? "Champion!" : "Game Over"}
        footer={
          <Button onClick={() => window.location.reload()} variant="secondary" size="lg">
            Play Again
          </Button>
        }
      >
        <p className="text-5xl font-bold tabular-nums text-cream">
          {score} <span className="text-2xl text-cream/40">/ {ACTOR_QUESTIONS.length}</span>
        </p>
        <p className="mt-3 text-cream/60">
          Time taken: <span className="font-mono text-gold">{formatTime(GUESS_TIME_SECONDS - timeLeft)}</span>
        </p>
        {isWinner && (
          <p className="mt-4 animate-fade-in text-sm text-gold">
            You&apos;re on the winner list! Stand a chance to win merch.
          </p>
        )}
        {submitting && (
          <p className="mt-4 text-sm text-cream/40 animate-pulse">Saving results...</p>
        )}
      </GameResultCard>
    );
  }

  return (
    <>
      <FadeIn>
        <div className="sticky top-[4.25rem] z-40 mb-6">
          <div className="glass-panel rounded-2xl p-5">
            <StatBox
              label="Time Remaining"
              value={formatTime(timeLeft)}
              urgent={timeLeft <= 30}
              className="border-0 bg-transparent p-0"
            />
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 pb-28 sm:grid-cols-2 lg:grid-cols-3">
        {ACTOR_QUESTIONS.map((q, i) => (
          <Stagger key={q.id} index={i}>
            <Card className="overflow-hidden p-0 transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10">
              <div className="relative">
                <span className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-bold text-maroon shadow-lg">
                  {q.id}
                </span>
                <ActorSmileImage
                  src={q.imageUrl}
                  alt={`Bollywood star ${q.id}`}
                  position={q.imagePosition}
                />
              </div>
              <div className="p-4">
                <Input
                  type="text"
                  placeholder="Enter actor name..."
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  className="py-2.5"
                />
              </div>
            </Card>
          </Stagger>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold/20 bg-maroon-dark/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl justify-center">
          <Button onClick={() => handleSubmit()} variant="primary" size="sm" className="w-full max-w-md shadow-xl shadow-gold/20">
            Submit Answers ✓
          </Button>
        </div>
      </div>
    </>
  );
}
