import { useState, useEffect } from "react";
import { GameProvider } from "./context/GameContext";
import { HomePage } from "./pages/HomePage";
import { SingleGame } from "./pages/SingleGame";
import { MultiArena } from "./pages/MultiArena";
import { MobileKeypadPage } from "./pages/MobileKeypadPage";
import { QRLobby } from "./pages/QRLobby";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const h = () => setHash(window.location.hash);
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return hash;
}

function parseHash(hash) {
  const clean = hash.replace(/^#\/?/, "");
  const parts = clean.split("/");
  return { route: parts[0] || "home", params: parts.slice(1) };
}

function AppRouter() {
  const hash = useHashRoute();
  const { route, params } = parseHash(hash);
  const [page, setPage] = useState("home");
  const [gameConfig, setGameConfig] = useState({ cats: [], types: [] });
  const [gamePool, setGamePool] = useState([]);

  // Phone routes — detected by URL hash
  if (route === "keypad" || route === "form") {
    const team = params[0]?.toUpperCase() === "B" ? "B" : "A";
    return <MobileKeypadPage team={team} />;
  }

  const goHome = () => {
    setPage("home");
    window.history.pushState(null, "", window.location.pathname);
  };

  if (page === "single") {
    return <SingleGame selectedCats={gameConfig.cats} selectedTypes={gameConfig.types} onBack={goHome} />;
  }

  if (page === "lobby") {
    return (
      <QRLobby
        selectedCats={gameConfig.cats}
        selectedTypes={gameConfig.types}
        onBack={goHome}
        onStart={(pool) => { setGamePool(pool); setPage("multi"); }}
      />
    );
  }

  if (page === "multi") {
    return (
      <MultiArena
        selectedCats={gameConfig.cats}
        selectedTypes={gameConfig.types}
        initialPool={gamePool}
        onBack={goHome}
      />
    );
  }

  return (
    <HomePage
      onStartSingle={(cats, types) => { setGameConfig({ cats, types }); setPage("single"); }}
      onStartMulti={(cats, types)  => { setGameConfig({ cats, types }); setPage("lobby"); }}
    />
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppRouter />
    </GameProvider>
  );
}
