export interface ActorQuestion {
  id: number;
  imageUrl: string;
  /** CSS object-position to frame the smile crop per photo */
  imagePosition: string;
  correctAnswer: string;
  aliases: string[];
}

export const GUESS_TIME_SECONDS = 180;

export const ACTOR_QUESTIONS: ActorQuestion[] = [
  {
    id: 1,
    imageUrl: "/games/actors/actor-1.jpg",
    imagePosition: "center 72%",
    correctAnswer: "Amitabh Bachchan",
    aliases: ["amitabh", "amitabh bachchan", "big b", "bachchan"],
  },
  {
    id: 2,
    imageUrl: "/games/actors/actor-2.jpg",
    imagePosition: "center 68%",
    correctAnswer: "Shah Rukh Khan",
    aliases: ["shah rukh khan", "srk", "shahrukh khan", "shahrukh"],
  },
  {
    id: 3,
    imageUrl: "/games/actors/actor-3.jpg",
    imagePosition: "center 75%",
    correctAnswer: "Dharmendra",
    aliases: ["dharmendra", "dharamendra"],
  },
  {
    id: 4,
    imageUrl: "/games/actors/actor-4.jpg",
    imagePosition: "center 70%",
    correctAnswer: "Raj Kapoor",
    aliases: ["raj kapoor", "showman"],
  },
  {
    id: 5,
    imageUrl: "/games/actors/actor-5.jpg",
    imagePosition: "center 65%",
    correctAnswer: "Salman Khan",
    aliases: ["salman khan", "salman", "bhai"],
  },
  {
    id: 6,
    imageUrl: "/games/actors/actor-6.jpg",
    imagePosition: "center 70%",
    correctAnswer: "Aamir Khan",
    aliases: ["aamir khan", "aamir", "mr perfectionist"],
  },
  {
    id: 7,
    imageUrl: "/games/actors/actor-7.jpg",
    imagePosition: "center 68%",
    correctAnswer: "Hrithik Roshan",
    aliases: ["hrithik roshan", "hrithik"],
  },
  {
    id: 8,
    imageUrl: "/games/actors/actor-8.jpg",
    imagePosition: "center 72%",
    correctAnswer: "Ranbir Kapoor",
    aliases: ["ranbir kapoor", "ranbir"],
  },
  {
    id: 9,
    imageUrl: "/games/actors/actor-9.jpg",
    imagePosition: "center 70%",
    correctAnswer: "Ranveer Singh",
    aliases: ["ranveer singh", "ranveer"],
  },
];

export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkAnswer(userAnswer: string, question: ActorQuestion): boolean {
  const normalized = normalizeAnswer(userAnswer);
  if (!normalized) return false;
  const allAnswers = [question.correctAnswer, ...question.aliases].map(normalizeAnswer);
  return allAnswers.some((a) => a === normalized || normalized.includes(a) || a.includes(normalized));
}

export function calculateScore(answers: Record<number, string>): number {
  return ACTOR_QUESTIONS.reduce((score, q) => {
    return score + (checkAnswer(answers[q.id] || "", q) ? 1 : 0);
  }, 0);
}
