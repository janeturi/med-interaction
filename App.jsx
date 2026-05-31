import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HomeScreen from "./screens/HomeScreen";
import LogScreen from "./screens/LogScreen";
import ConfirmScreen from "./screens/ConfirmScreen";
import ResultsScreen from "./screens/ResultsScreen";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [meds, setMeds] = useState([]);

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <HomeScreen key="home" onStart={() => setScreen("log")} />
        )}
        {screen === "log" && (
          <LogScreen
            key="log"
            meds={meds}
            setMeds={setMeds}
            onBack={() => setScreen("home")}
            onContinue={() => setScreen("confirm")}
          />
        )}
        {screen === "confirm" && (
          <ConfirmScreen
            key="confirm"
            meds={meds}
            onBack={() => setScreen("log")}
            onConfirm={() => setScreen("results")}
          />
        )}
        {screen === "results" && (
          <ResultsScreen
            key="results"
            meds={meds}
            onRelog={() => { setMeds([]); setScreen("home"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
