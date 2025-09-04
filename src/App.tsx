import { useEffect, useRef, useState } from "react";
import "./App.css";

function Display() {
  return <></>;
}

function Controlls() {
  return <></>;
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
      <Controlls />
    </>
  );
}
