"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ActorQuestion,
  GuessResult,
  GUESS_TIME_SECONDS,
  TOTAL_QUESTIONS,
  createShuffledRound,
  getOptionsForQuestion,
} from "@/lib/game-data/actors";
import { Button } from "@/components/ui/Button";
import { GameStartCard, GameResultCard } from "@/components/ui/GameScreen";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

function CenteredScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-hidden px-2">
      {children}
    </div>
  );
}

export function GuessActorGame() {
  const [round, setRound] = useState<ActorQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<GuessResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(GUESS_TIME_SECONDS);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [locked, setLocked] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishedRef = useRef(false);
  const resultsRef = useRef<GuessResult[]>([]);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(GUESS_TIME_SECONDS);

  resultsRef.current = results;
  scoreRef.current = score;
  timeLeftRef.current = timeLeft;

  const currentQuestion = round[currentIndex] ?? null;
  const options = useMemo(
    () => (currentQuestion ? getOptionsForQuestion(currentQuestion) : []),
    [currentQuestion]
  );

  const finishGame = useCallback((finalResults: GuessResult[], finalScore: number, elapsed: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setResults(finalResults);
    setScore(finalScore);
    setElapsedSeconds(elapsed);
    setFinished(true);
  }, []);

  const handleSubmitScore = async () => {
    if (scoreSubmitted || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/games/guess-actor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          totalQuestions: TOTAL_QUESTIONS,
          timeTakenSeconds: elapsedSeconds,
          results,
        }),
      });
      if (res.ok) setScoreSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const finishGameRef = useRef(finishGame);
  finishGameRef.current = finishGame;

  const startGame = () => {
    finishedRef.current = false;
    setRound(createShuffledRound());
    setCurrentIndex(0);
    setScore(0);
    setResults([]);
    setTimeLeft(GUESS_TIME_SECONDS);
    setFinished(false);
    setScoreSubmitted(false);
    setElapsedSeconds(0);
    setSubmitting(false);
    setLocked(false);
    setStarted(true);
  };

  useEffect(() => {
    if (!started || finished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!finishedRef.current) {
            finishGameRef.current(
              resultsRef.current,
              scoreRef.current,
              GUESS_TIME_SECONDS
            );
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished]);

  const advanceOrFinish = useCallback(
    (nextResults: GuessResult[], nextScore: number, nextIndex: number) => {
      if (nextIndex >= round.length) {
        finishGame(
          nextResults,
          nextScore,
          GUESS_TIME_SECONDS - timeLeftRef.current
        );
        return;
      }

      setResults(nextResults);
      setScore(nextScore);
      setCurrentIndex(nextIndex);
      setLocked(false);
    },
    [finishGame, round.length]
  );

  const handleAnswer = (selected: string) => {
    if (!currentQuestion || locked || finished) return;

    setLocked(true);
    const isCorrect = selected === currentQuestion.name;
    const nextResult: GuessResult = {
      actorId: currentQuestion.id,
      selected,
      correct: isCorrect,
    };
    const nextResults = [...results, nextResult];
    const nextScore = isCorrect ? score + 1 : score;

    window.setTimeout(() => {
      advanceOrFinish(nextResults, nextScore, currentIndex + 1);
    }, 250);
  };

  if (!started) {
    return (
      <CenteredScreen>
        <GameStartCard
          emoji="🎬"
          title="Guess The Star"
          subtitle="Smile Edition"
          description={`Identify Bollywood stars from their smiles. You get ${GUESS_TIME_SECONDS} seconds for ${TOTAL_QUESTIONS} images — pick the right name from 4 options. Every play shuffles the order!`}
          onStart={startGame}
        />
      </CenteredScreen>
    );
  }

  if (finished) {
    const isWinner = score === TOTAL_QUESTIONS;
    return (
      <CenteredScreen>
        <GameResultCard
          emoji={isWinner ? "🏆" : "⭐"}
          title={isWinner ? "Perfect Score!" : "Time's Up!"}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleSubmitScore}
                variant="primary"
                size="lg"
                disabled={submitting || scoreSubmitted}
              >
                {scoreSubmitted ? "Submitted ✓" : submitting ? "Submitting..." : "Submit Score"}
              </Button>
              <Button onClick={startGame} variant="secondary" size="lg">
                Play Again
              </Button>
            </div>
          }
        >
          <p className="text-5xl font-bold tabular-nums text-cream">
            {score} <span className="text-2xl text-cream/40">/ {TOTAL_QUESTIONS}</span>
          </p>
          <p className="mt-3 text-cream/60">
            Answered {results.length} of {TOTAL_QUESTIONS} smiles
          </p>
        </GameResultCard>
      </CenteredScreen>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden sm:gap-3">
      <div className="glass-panel grid shrink-0 grid-cols-3 gap-2 rounded-xl p-2 sm:p-2.5">
        <div className={cn("text-left", timeLeft <= 10 && "animate-pulse")}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-cream/50">Time</p>
          <p className={cn("font-mono text-lg font-bold tabular-nums sm:text-xl", timeLeft <= 10 ? "text-red-300" : "text-gold-light")}>
            {formatTime(timeLeft)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cream/50">Score</p>
          <p className="font-mono text-lg font-bold tabular-nums text-gold-light sm:text-xl">{score}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cream/50">Smile</p>
          <p className="font-mono text-lg font-bold tabular-nums text-gold-light sm:text-xl">
            {currentIndex + 1}/{TOTAL_QUESTIONS}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="relative aspect-square h-auto max-h-full w-full max-w-full overflow-hidden rounded-2xl border-2 border-gold/30 bg-black shadow-2xl shadow-black/50 sm:h-full sm:w-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentQuestion.id}
            src={currentQuestion.imageUrl}
            alt="Guess the Bollywood star"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="glass-panel shrink-0 rounded-xl border border-gold/30 p-2.5 sm:rounded-2xl sm:p-3">
        <p className="mb-2 text-center text-xs font-medium text-cream/70 sm:text-sm">
          Who is this star?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <Button
              key={option}
              variant="secondary"
              size="sm"
              disabled={locked}
              onClick={() => handleAnswer(option)}
              className={cn(
                "min-h-10 w-full rounded-xl px-2 text-xs leading-tight sm:min-h-11 sm:text-sm",
                locked && "pointer-events-none"
              )}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
