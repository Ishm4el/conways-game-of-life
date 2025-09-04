import { useEffect, useRef, useState } from "react";
import "./App.css";

type run = boolean;
type setRun = React.Dispatch<React.SetStateAction<boolean>>;

interface Controlls {
  run: run;
  setRun: setRun;
}

function Display() {
  return <></>;
}

function Controlls({ run, setRun }: Controlls) {
  const buttonStartHandler = () => {
    setRun(true);
  };

  const buttonPauseHandler = () => {
    setRun(false);
  };

  return (
    <div className="controlls-container">
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
    </div>
  );
}

export default function App() {
  const intervalId = useRef<number | undefined>(undefined);
  const [run, setRun] = useState<boolean>(false);

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
      <Display />
      <Controlls run={run} setRun={setRun} />
    </>
  );
}
