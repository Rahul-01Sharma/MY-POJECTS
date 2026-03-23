export const CATEGORIES = [
  { id: "reasoning", label: "Reasoning", icon: "🧩", color: "#a78bfa" },
  { id: "time_distance", label: "Time & Distance", icon: "⏱️", color: "#34d399" },
  { id: "relations", label: "Relations", icon: "👨‍👩‍👧", color: "#f472b6" },
  { id: "numbers", label: "Numbers", icon: "🔢", color: "#60a5fa" },
  { id: "analogy", label: "Analogy", icon: "🔗", color: "#fbbf24" },
  { id: "coding_decoding", label: "Coding & Decoding", icon: "💻", color: "#fb923c" },
  { id: "series", label: "Series", icon: "📈", color: "#2dd4bf" },
  { id: "general", label: "General", icon: "📚", color: "#94a3b8" },
];

// Q types: "qa" | "mcq" | "picture"
export const DEFAULT_QUESTIONS = [
  {
    id: "q1", type: "qa", category: "numbers",
    question: "What is 12 × 12?", answer: "144",
  },
  {
    id: "q2", type: "mcq", category: "reasoning",
    question: "Which number comes next: 2, 4, 8, 16, ?",
    options: ["24", "32", "30", "28"], answer: "32",
  },
  {
    id: "q3", type: "qa", category: "time_distance",
    question: "A train travels 120 km in 2 hours. What is its speed in km/h?",
    answer: "60",
  },
  {
    id: "q4", type: "mcq", category: "relations",
    question: "If A is the brother of B, B is the sister of C. How is A related to C?",
    options: ["Brother", "Sister", "Uncle", "Cousin"], answer: "Brother",
  },
  {
    id: "q5", type: "qa", category: "analogy",
    question: "Book is to Library as Painting is to ?",
    answer: "Museum",
  },
  {
    id: "q6", type: "mcq", category: "coding_decoding",
    question: "If CAT = 3120, then DOG = ?",
    options: ["41516", "4157", "41517", "40515"], answer: "41516",
  },
  {
    id: "q7", type: "qa", category: "series",
    question: "What comes next: Z, X, V, T, ?",
    answer: "R",
  },
  {
    id: "q8", type: "mcq", category: "numbers",
    question: "What is the square root of 169?",
    options: ["11", "12", "13", "14"], answer: "13",
  },
  {
    id: "q9", type: "qa", category: "time_distance",
    question: "If a car covers 300 km in 5 hours, how long to cover 420 km?",
    answer: "7",
  },
  {
    id: "q10", type: "mcq", category: "reasoning",
    question: "Odd one out: Apple, Mango, Potato, Banana",
    options: ["Apple", "Mango", "Potato", "Banana"], answer: "Potato",
  },
];
