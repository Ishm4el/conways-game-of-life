import {
  createContext,
  createElement,
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

// use to create a GameContext
const GameContext = createContext<null | {
  run: boolean;
}>(null);

// use to get the context of the GameContext
function useGameContext() {
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error(
      "gameContext has to be used within <GameContext.Provider>!"
    );
  }
  return gameContext;
}

// checks whether the cell at x and y is alive or not
const isAlive = (x: number, y: number) => {
  return document.querySelector(
    `div[data-x="${x}"][data-y="${y}"][data-living="true"]`
  )
    ? true
    : false;
};

// counts the number of living neighbors surrounding
// the cell at x and y.
const countLivingNeighbors = (x: number, y: number) => {
  let livingNeighbors = 0;

  // increments 'livingNeighbors' if a
  // neighbor cell at x and y is alive
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

// determines whether a cell at x and y should die
const shouldDie = (x: number, y: number) => {
  const numberOfLivingNeighbors = countLivingNeighbors(x, y);
  return !(numberOfLivingNeighbors === 2 || numberOfLivingNeighbors === 3);
};

// determines whether a cell at x and y should revive
const shouldRevive = (x: number, y: number) => {
  const numberOfLivingNeighbors = countLivingNeighbors(x, y);
  return numberOfLivingNeighbors === 3;
};

// the mouseEventHandler to toggle a cell alive or dead
function mouseEventHandlerToggleCell(
  ev: React.MouseEvent<HTMLElement, MouseEvent>
) {
  if (ev.currentTarget.dataset["living"] === "true")
    ev.currentTarget.setAttribute("data-living", "false");
  else ev.currentTarget.setAttribute("data-living", "true");
}

// Generates the initial display of the game.
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
          // "data-living": false.toString(),
          "data-living": Math.floor(Math.random() * 3) === 1,
          onClick: mouseEventHandlerToggleCell,
          key: `cell_x-${j}_y-${i}_${Date.now()}`,
        })
      );
    }
    const row = createElement(
      "div",
      {
        className: "life-row",
        key: `row_y-${i}_${Date.now()}`,
      },
      rowcolumns
    );
    display.push(row);
  }
  return display;
};

// applies the logic of the game to the board
const stepLogic = (x: number, y: number) => {
  return isAlive(x, y) ? !shouldDie(x, y) : shouldRevive(x, y);
};

// steps the game board 1 frame forward.
const stepDisplay = () => {
  const newDisplay = [];
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    const rowcolumns = [];
    for (let j = 0; j < DISPLAY_WIDTH; j++) {
      const setLiving = stepLogic(j, i);
      rowcolumns.push(
        createElement("div", {
          className: "life-container",
          "data-x": j.toString(),
          "data-y": i.toString(),
          "data-living": setLiving,
          onClick: mouseEventHandlerToggleCell,
          key: `cell_x-${j}_y-${i}_${Date.now()}`,
        })
      );
    }
    const row = createElement(
      "div",
      {
        className: "life-row",
        key: `row_y-${i}_${Date.now()}`,
      },
      rowcolumns
    );
    newDisplay.push(row);
  }
  return newDisplay;
};

// The Display Component of the application
function Display({ displayRef }: Display) {
  const intervalId = useRef<number | undefined>(undefined);
  const { run } = useGameContext();
  // let display = useMemo(() => generateDisplay(), []);
  const [display, setDisplay] = useState(generateDisplay());

  useEffect(() => {
    if (run) {
      intervalId.current = setInterval(() => {
        setDisplay(stepDisplay());
      }, 400);
    } else {
      clearInterval(intervalId.current);
    }

    return () => {
      clearInterval(intervalId.current);
    };
  }, [run]);

  return (
    <section className="display-container" ref={displayRef}>
      {display}
    </section>
  );
}

// The controlls component of the application
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

// The main app
export default function App() {
  const [run, setRun] = useState<boolean>(false);
  const displayRef = useRef<null | HTMLElement>(null);
  const [displayKey, displayKeyDispatch] = useReducer((x) => x + 1, 1);

  const contextValue = useMemo(() => ({ run }), [run]);

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
