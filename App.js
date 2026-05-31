import './App.css';
import { motion } from "framer-motion"; // adds animations
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Logo from './logo';
import btnBackground from './assets/btnBackground.svg';
import altButton from './assets/altButton.svg';
import plant from './assets/plant.svg';
import { useEffect, useRef } from "react";
import { checkInteractions, getSideEffects, deleteMed } from "./api";

function App() {
  const [screen, setScreen] = useState("home");
  const [meds, setMeds] = useState([]);

  return (
    <div className="App">
      <FloatingLeaves />
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <HomeScreen key="home" onStart={() => setScreen("log")} />
        )}
        {screen === "log" && (
          <LoggingScreen
            key="log"
            meds={meds}
            setMeds={setMeds}
            onBack={() => setScreen("home")}
            onContinue={() => setScreen("check")}
          />
        )}
        {screen === "check" && (
          <CheckScreen
            key="check"
            meds={meds}
            onBack={() => setScreen("log")}
            onConfirm={() => setScreen("analysis")}
          />
        )}
        {screen === "analysis" && (
          <AnalysisScreen
            key="analysis"
            meds={meds}
            onBack={() => setScreen("log")}
            onRelog={() => { setMeds([]); setScreen("home");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
 
/* render function to take in spring boot api */



/* type writer effect */

function Typewriter({ text, speed = -5 }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

function Button({ label, onClick, variant = "primary"}) {
  const buttonImages = {
    primary: btnBackground,
    altgreen: btnBackground, // Maps to your green asset
    altgray: altButton,      // Maps to your gray asset
  };

  const chosenImage = buttonImages[variant] || buttonImages.primary;

  return (
    <motion.button
      className={`btn btn-${variant}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <img src={chosenImage} alt="" />
      <span>{label}</span>
    </motion.button>
  );
}




// homescreen


function FloatingLeaves() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawLeaf = (ctx, x, y, size, rotation, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#7A9B6A";
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size, -size, size, size, 0, size);
      ctx.bezierCurveTo(-size, size, -size, -size, 0, -size);
      ctx.fill();

      ctx.strokeStyle = "#5a7a4a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.stroke();
      ctx.restore();
    };

    const leaves = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: Math.random() * 0.4 + 0.2,
      opacity: Math.random() * 0.25 + 0.05,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    }));

    let animId;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      leaves.forEach((leaf) => {
        leaf.wobble += leaf.wobbleSpeed;
        leaf.x += Math.sin(leaf.wobble) * 0.5 + leaf.speedX;
        leaf.y += leaf.speedY;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > canvas.height + 20) {
          leaf.y = -20;
          leaf.x = Math.random() * canvas.width;
        }
        if (leaf.x > canvas.width + 20) leaf.x = -20;
        if (leaf.x < -20) leaf.x = canvas.width + 20;

        drawLeaf(ctx, leaf.x, leaf.y, leaf.size, leaf.rotation, leaf.opacity);
      });

      animId = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

function HomeScreen({ onStart }) {
  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
        <Logo />
        <p className="tagline">
          <Typewriter text="Ease anxieties, track your medications." speed={40} />
        </p>
      <div className="plant">
        <img src={plant} alt="" />
        </div>
      <Button label="Start Logging" onClick={onStart} variant="primary"/>
    </motion.div>
  );
}



// logging screen
// wrap in stylization 

function LoggingScreen({ meds, setMeds, onBack, onContinue }) {
  const [input, setInput] = useState("");

  
  const addMed = () => {
    const val = input.trim();
    if (!val || meds.includes(val)) return;
    setMeds([...meds, val]);
    setInput("");
  };

  const removeMed = async (i) => {
  const medName = meds[i];
  try {
    await deleteMed(medName);
  } catch (e) {
    console.warn("Could not delete from backend:", medName);
  }
  setMeds(meds.filter((_, idx) => idx !== i));
};

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <p className="msg">
       <Typewriter text="Log your medications below." speed={40} />
       </p>
      <div className="med-container">
        <div className="med-input-wrap">
          <input
            className="textbox"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMed()}
            placeholder="Type a medication name..."
          />
        </div>
      
  <div className="med-list">
    <AnimatePresence>
      {meds.map((med, i) => (
        <motion.div
          key={med}
          className="meds"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
        >
          <span>{med}</span>
          <button className="remove-btn" onClick={() => removeMed(i)}>×</button>
          
        </motion.div>
      ))}
    </AnimatePresence>
     </div>
      </div>
      <Button label="Continue" onClick={onContinue} variant="altgreen" />
      <Button label="Go Back" onClick={onBack} variant="altgray">← back</Button>
    </motion.div>
  );
}



// check screen
function CheckScreen({ meds, onBack, onConfirm }) {
  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <p className="msg">
        <Typewriter text="Does everything look correct?" speed={40} />
      </p>

      <div className="med-list">
        <AnimatePresence>
          {meds.map((med, i) => (
            <motion.div
              key={med}
              className="meds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              {med}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button label="Continue" onClick={onConfirm} variant="altgreen" />
      <Button label="Go Back" onClick={onBack} variant="altgray" />
    </motion.div>
  );
}

// analysis screen
// -> works with spring boot, need to add css and styling but should be ok
function AnalysisScreen({ meds , onBack}) {
  const [interactions, setInteractions] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [interactionData, warningData] = await Promise.all([
          checkInteractions(meds),
          getSideEffects(meds),
        ]);
        setInteractions(interactionData);
        setWarnings(warningData);
      } catch (e) {
        setError("Unable to reach server! Reach out to owner :)");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [meds]);


  if (loading) return 
    <p className="msg">
      <Typewriter text="Loading results. Please wait.." speed={40} />
      </p>
  if (error) return <p className="msg">
       <Typewriter text="Error. Reload to try again!" speed={40} />
       </p>

  return (

    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
    <div className="results-box">
      <p className="result-label"> <Typewriter text="Interactions" speed={40} /> </p>
      {interactions.map((item, i) => (
        <div key={i} className="result-item">{item}</div>
      ))}

      <p className="result-label"> <Typewriter text="Warnings" speed={40} /> </p>
      {warnings.map((item, i) => (
        <div key={i} className="result-item">{item}</div>
      ))}
    </div>  

    <Button label="Try again?" onClick={onBack} variant="altgray" />
    </motion.div>
  );
}



export default App;
