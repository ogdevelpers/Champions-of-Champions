export interface ActorQuestion {
  id: string;
  name: string;
  imageUrl: string;
}

export interface GuessResult {
  actorId: string;
  selected: string;
  correct: boolean;
}

export const GUESS_TIME_SECONDS = 30;
export const TOTAL_QUESTIONS = 24;
export const OPTIONS_PER_QUESTION = 4;

export const ACTOR_QUESTIONS: ActorQuestion[] = [
  { id: "vijay", name: "Vijay", imageUrl: "/games/actors/smiles/vijay.png" },
  { id: "hema-malini", name: "Hema Malini", imageUrl: "/games/actors/smiles/hema-malini.png" },
  { id: "sridevi", name: "Sridevi", imageUrl: "/games/actors/smiles/sridevi.png" },
  { id: "dimple-kapadia", name: "Dimple Kapadia", imageUrl: "/games/actors/smiles/dimple-kapadia.png" },
  { id: "neetu-singh", name: "Neetu Singh", imageUrl: "/games/actors/smiles/neetu-singh.png" },
  { id: "rekha", name: "Rekha", imageUrl: "/games/actors/smiles/rekha.png" },
  { id: "dharmendra", name: "Dharmendra", imageUrl: "/games/actors/smiles/dharmendra.png" },
  { id: "alia-bhatt", name: "Alia Bhatt", imageUrl: "/games/actors/smiles/alia-bhatt.png" },
  { id: "kiara-advani", name: "Kiara Advani", imageUrl: "/games/actors/smiles/kiara-advani.png" },
  { id: "amitabh-bachchan", name: "Amitabh Bachchan", imageUrl: "/games/actors/smiles/amitabh-bachchan.png" },
  { id: "yash", name: "Yash", imageUrl: "/games/actors/smiles/yash.png" },
  { id: "prabhas", name: "Prabhas", imageUrl: "/games/actors/smiles/prabhas.png" },
  { id: "samantha-prabhu", name: "Samantha Prabhu", imageUrl: "/games/actors/smiles/samantha-prabhu.png" },
  { id: "rajesh-khanna", name: "Rajesh Khanna", imageUrl: "/games/actors/smiles/rajesh-khanna.png" },
  { id: "rajinikanth", name: "Rajinikanth", imageUrl: "/games/actors/smiles/rajinikanth.png" },
  { id: "allu-arjun", name: "Allu Arjun", imageUrl: "/games/actors/smiles/allu-arjun.png" },
  { id: "rashmika-mandanna", name: "Rashmika Mandanna", imageUrl: "/games/actors/smiles/rashmika-mandanna.png" },
  { id: "mithun-chakraborty", name: "Mithun Chakraborty", imageUrl: "/games/actors/smiles/mithun-chakraborty.png" },
  { id: "ananya-pandey", name: "Ananya Pandey", imageUrl: "/games/actors/smiles/ananya-pandey.png" },
  { id: "shah-rukh-khan", name: "Shah Rukh Khan", imageUrl: "/games/actors/smiles/shah-rukh-khan.png" },
  { id: "ram-charan", name: "Ram Charan", imageUrl: "/games/actors/smiles/ram-charan.png" },
  { id: "sanjay-dutt", name: "Sanjay Dutt", imageUrl: "/games/actors/smiles/sanjay-dutt.png" },
  { id: "anil-kapoor", name: "Anil Kapoor", imageUrl: "/games/actors/smiles/anil-kapoor.png" },
  { id: "salman-khan", name: "Salman Khan", imageUrl: "/games/actors/smiles/salman-khan.png" },
];

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createShuffledRound(): ActorQuestion[] {
  return shuffleArray(ACTOR_QUESTIONS);
}

export function getOptionsForQuestion(question: ActorQuestion): string[] {
  const distractors = shuffleArray(
    ACTOR_QUESTIONS.filter((actor) => actor.id !== question.id).map((actor) => actor.name)
  ).slice(0, OPTIONS_PER_QUESTION - 1);

  return shuffleArray([question.name, ...distractors]);
}

export function calculateScore(results: GuessResult[]): number {
  return results.filter((result) => result.correct).length;
}
