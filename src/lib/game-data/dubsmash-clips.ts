export interface DubsmashClip {
  id: string;
  title: string;
  movie: string;
  dialogue: string;
  duration: number;
  audioUrl: string;
}

export const DUBSMASH_CLIPS: DubsmashClip[] = [
  {
    id: "sholay-dialogue",
    title: "Kitne Aadmi The?",
    movie: "Sholay",
    dialogue: "Kitne aadmi the? ... Poore ek sau aadmi the!",
    duration: 8,
    audioUrl: "",
  },
  {
    id: "don-dialogue",
    title: "Don Ko Pakadna Mushkil Hi Nahi",
    movie: "Don",
    dialogue: "Don ko pakadna mushkil hi nahi, namumkin hai!",
    duration: 6,
    audioUrl: "",
  },
  {
    id: "ddlj-dialogue",
    title: "Ja Simran Ja",
    movie: "Dilwale Dulhania Le Jayenge",
    dialogue: "Ja Simran ja, jee le apni zindagi!",
    duration: 5,
    audioUrl: "",
  },
  {
    id: "3idiots-dialogue",
    title: "All Is Well",
    movie: "3 Idiots",
    dialogue: "All is well! All is well!",
    duration: 5,
    audioUrl: "",
  },
];
