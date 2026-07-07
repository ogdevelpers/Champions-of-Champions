export interface PosterTemplate {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  imageUrl: string;
  accentColor: string;
}

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: "deewaar",
    title: "DEEWAAR",
    subtitle: "The Wall of Conflict",
    year: "1975",
    imageUrl: "/posters/deewaar.png",
    accentColor: "#FFD700",
  },
  {
    id: "delhi-6",
    title: "DELHI-6",
    subtitle: "Stories from the Walled City",
    year: "2009",
    imageUrl: "/posters/delhi-6.png",
    accentColor: "#c9a227",
  },
  {
    id: "agneepath",
    title: "AGNEEPATH",
    subtitle: "The Path of Fire",
    year: "2012",
    imageUrl: "/posters/agneepath.png",
    accentColor: "#ff6b35",
  },
];
