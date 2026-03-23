import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_QUESTIONS } from "../data/questions";

const GameContext = createContext(null);

const STORAGE_KEY = "tow_questions_v2";
const FORMS_KEY   = "tow_google_forms_v1";

export function GameProvider({ children }) {
  // ── Questions (persisted) ──────────────────────────────────────────────────
  const [questions, setQuestionsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    } catch { return DEFAULT_QUESTIONS; }
  });

  const setQuestions = useCallback((qs) => {
    setQuestionsState(qs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(qs)); } catch {}
  }, []);

  const addQuestion = useCallback((q) => {
    setQuestions([...questions, { ...q, id: "q_" + Date.now() }]);
  }, [questions, setQuestions]);

  const deleteQuestion = useCallback((id) => {
    setQuestions(questions.filter(q => q.id !== id));
  }, [questions, setQuestions]);

  // ── Google Form URLs (persisted) ──────────────────────────────────────────
  const [formUrls, setFormUrlsState] = useState(() => {
    try {
      const saved = localStorage.getItem(FORMS_KEY);
      return saved ? JSON.parse(saved) : { A: "", B: "" };
    } catch { return { A: "", B: "" }; }
  });

  const setFormUrls = useCallback((urls) => {
    setFormUrlsState(urls);
    try { localStorage.setItem(FORMS_KEY, JSON.stringify(urls)); } catch {}
  }, []);

  // ── Live game state (for QR / multi-device mode) ───────────────────────────
  const [gameSession, setGameSession] = useState(null);
  // gameSession shape:
  // { id, mode:"single"|"multi", currentQ, ropePos, scoreA, scoreB,
  //   submittedA: false, submittedB: false, answerA:"", answerB:"",
  //   status:"waiting"|"playing"|"won", winner:null, usedIds:[] }

  const startSession = useCallback((mode, selectedCats, selectedTypes) => {
    const pool = questions.filter(q =>
      (selectedCats.length === 0 || selectedCats.includes(q.category)) &&
      (selectedTypes.length === 0 || selectedTypes.includes(q.type))
    );
    if (!pool.length) return null;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const first = shuffled[0];
    const session = {
      id: Date.now().toString(),
      mode,
      pool: shuffled,
      currentIdx: 0,
      currentQ: first,
      ropePos: 0,
      scoreA: 0,
      scoreB: 0,
      submittedA: false,
      submittedB: false,
      answerA: "",
      answerB: "",
      feedbackA: null,
      feedbackB: null,
      status: "playing",
      winner: null,
    };
    setGameSession(session);
    return session;
  }, [questions]);

  const updateSession = useCallback((updater) => {
    setGameSession(prev => prev ? { ...prev, ...updater } : prev);
  }, []);

  const endSession = useCallback(() => setGameSession(null), []);

  return (
    <GameContext.Provider value={{
      questions, addQuestion, deleteQuestion, setQuestions,
      formUrls, setFormUrls,
      gameSession, startSession, updateSession, endSession,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
