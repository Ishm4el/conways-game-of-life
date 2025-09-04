import { createElement, useEffect, useRef, useState } from "react";
import "./App.css";

type run = boolean;
type setRun = React.Dispatch<React.SetStateAction<boolean>>;

interface Controlls {
  run: run;
  setRun: setRun;
}

interface Display {
  displayRef: React.RefObject<HTMLElement | null>;
}

const DISPLAY_WIDTH: number = 30,
  DISPLAY_HEIGHT: number = 15;

function Display({ displayRef }: Display) {
  const generateDisplay = () => {
    const display = [];
    for (let i = 0; i < DISPLAY_HEIGHT; i++) {
      const rowcolumns = [];
      for (let j = 0; j < DISPLAY_WIDTH; j++) {
        rowcolumns.push(
          createElement("div", {
            className: "life-container",
            "data-x": j,
            "data-y": i,
            "data-living": Math.floor(Math.random() * 2) === 1,
            onClick: (ev) => {
              console.log(
                `x: ${ev.currentTarget.dataset.x}, y: ${ev.currentTarget.dataset.y}`
              );
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

  return (
    <section className="display-container" ref={displayRef}>
      {generateDisplay()}
    </section>
  );
}

function Controlls({ run, setRun }: Controlls) {
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
          <button>Generate Placements</button>
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

  useEffect(() => {
    if (run) {
      intervalId.current = setInterval(() => {}, 400);
    }

    return () => {
      clearInterval(intervalId.current);
    };
  });

  return (
    <>
      <Display displayRef={displayRef} />
      <Controlls run={run} setRun={setRun} />
    </>
  );
}
