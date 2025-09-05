import {
  createContext,
  createElement,
  memo,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import "./App.css";

type run = boolean;
type setRun = React.Dispatch<React.SetStateAction<boolean>>;

interface Controlls {
  run: run;
  setRun: setRun;
  displayKeyDispatch: React.ActionDispatch<[]>;
}

interface Display {
  displayRef: React.RefObject<HTMLElement | null>;
  run: boolean;
}

const DISPLAY_WIDTH: number = 30,
  DISPLAY_HEIGHT: number = 15;

const GameContext = createContext<null | {
  run: boolean;
}>(null);

function useGameContext() {
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error(
      "gameContext has to be used within <GameContext.Provider>!"
    );
  }
  return gameContext;
}

const isAlive = (x: number, y: number) => {
  return document.querySelector(
    `div[data-x="${x}"][data-y="${y}"][data-living="true"]`
  )
    ? true
    : false;
};

const countLivingNeighbors = (x: number, y: number) => {
  let livingNeighbors = 0;
  const incrementLivingNeighbors = (x: number, y: number) => {
    if (isAlive(x, y)) livingNeighbors++;
  };

  const topY = y - 1;
  const botY = y + 1;

  const leftX = x - 1;
  const rightX = x + 1;

  // top row
  incrementLivingNeighbors(leftX, topY);
  incrementLivingNeighbors(x, topY);
  incrementLivingNeighbors(rightX, topY);
  // middle row
  incrementLivingNeighbors(leftX, y);
  incrementLivingNeighbors(rightX, y);
  // bottom row
  incrementLivingNeighbors(leftX, botY);
  incrementLivingNeighbors(x, botY);
  incrementLivingNeighbors(rightX, botY);

  return livingNeighbors;
};

const shouldDie = (x: number, y: number) => {
  const numberOfLivingNeighbors = countLivingNeighbors(x, y);
  return numberOfLivingNeighbors === 2 || numberOfLivingNeighbors === 3
    ? false
    : true;
};

const shouldRevive = (x: number, y: number) => {
  const numberOfLivingNeighbors = countLivingNeighbors(x, y);
  return numberOfLivingNeighbors === 3;
};

const generateDisplay = () => {
  const display = [];
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    const rowcolumns = [];
    for (let j = 0; j < DISPLAY_WIDTH; j++) {
      rowcolumns.push(
        createElement("div", {
          className: "life-container",
          "data-x": j.toString(),
          "data-y": i.toString(),
          "data-living": Math.floor(Math.random() * 2) === 1,
          onClick: (ev) => {
            const x = Number(ev.currentTarget.dataset.x);
            const y = Number(ev.currentTarget.dataset.y);
            console.log(`x: ${typeof x}, y: ${y}`);
            if (x && y) console.log(isAlive(x, y));
          },
        })
      );
    }
    const row = createElement(
      "div",
      {
        className: "life-row",
      },
      rowcolumns
    );
    display.push(row);
  }
  return display;
};

const stepLogic = (x: number, y: number) => {
  if (isAlive(x, y)) return !shouldDie(x, y);
  else return shouldRevive(x, y);
};

const stepDisplay = () => {
  const newDisplay = [];
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    const rowcolumns = [];
    for (let j = 0; j < DISPLAY_WIDTH; j++) {
      rowcolumns.push(
        createElement("div", {
          className: "life-container",
          "data-x": j.toString(),
          "data-y": i.toString(),
          "data-living": `${stepLogic(j, i)}`,
          onClick: (ev) => {
            const x = Number(ev.currentTarget.dataset.x);
            const y = Number(ev.currentTarget.dataset.y);
            console.log(`x: ${typeof x}, y: ${y}`);
            if (x && y) console.log(isAlive(x, y));
          },
        })
      );
    }
    const row = createElement(
      "div",
      {
        className: "life-row",
      },
      rowcolumns
    );
    newDisplay.push(row);
  }
  return newDisplay;
};

const Display = memo(({ displayRef }: Display) => {
  const { run } = useGameContext();
  let display = useMemo(() => generateDisplay(), []);
  console.log(run);

  useEffect(() => {
    console.log("game is running");
    display = stepDisplay();
  }, [run]);

  return (
    <section className="display-container" ref={displayRef}>
      {display}
    </section>
  );
});

function Controlls({ run, setRun, displayKeyDispatch }: Controlls) {
  const buttonStartHandler = () => {
    setRun(true);
  };

  const buttonPauseHandler = () => {
    setRun(false);
  };

  return (
    <section className="controlls-container">
      {run ? (
        <>
          <button onClick={buttonPauseHandler}>Pause</button>
        </>
      ) : (
        <>
          <button onClick={displayKeyDispatch}>Generate Placements</button>
          <button onClick={buttonStartHandler}>Start</button>
        </>
      )}
    </section>
  );
}

export default function App() {
  const intervalId = useRef<number | undefined>(undefined);
  const [run, setRun] = useState<boolean>(false);
  const displayRef = useRef<null | HTMLElement>(null);
  const [displayKey, displayKeyDispatch] = useReducer((x) => x + 1, 1);

  const contextValue = useMemo(() => ({ run }), [run]);

  useEffect(() => {
    console.log(displayRef.current);

    if (run) {
      intervalId.current = setInterval(() => {}, 400);
    }

    return () => {
      clearInterval(intervalId.current);
    };
  }, []);

  return (
    <>
      <GameContext.Provider value={contextValue}>
        <Display displayRef={displayRef} key={displayKey} run={run} />
        <Controlls
          run={run}
          setRun={setRun}
          displayKeyDispatch={displayKeyDispatch}
        />
      </GameContext.Provider>
    </>
  );
}
