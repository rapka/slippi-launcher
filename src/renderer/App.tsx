/* eslint-disable import/no-default-export */
import "./App.global.scss";

import React from "react";
import { MemoryRouter as Router, Route, Routes } from "react-router-dom";

import icon, { ReactComponent as LogoIcon } from "../../assets/icon.svg";

const Hello = () => {
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    return window.electron.counter.onCounterChange((val: number) => {
      console.log(`received counter changed event from main. value: ${val}`);
      setCounter(val);
    });
  });

  React.useEffect(() => {
    return window.electron.ipcRenderer.on("ipc-example", (arg: any) => {
      console.log(arg);
    });
  });

  const onPingClick = () => window.electron.ipcRenderer.myPing();
  const incrementCounter = () => {
    console.log("inc counter button pressed");
    window.electron.counter.incrementCounter().catch(console.error);
  };
  const decrementCounter = () => {
    console.log("dec counter button pressed");
    window.electron.counter.decrementCounter().catch(console.error);
  };

  return (
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
        <LogoIcon />
      </div>
      <h1>Hello world!</h1>
      <div className="Hello">
        <button type="button" onClick={onPingClick}>
          Ping IPC
        </button>
      </div>
      <h1>Counter: {counter}</h1>
      <button type="button" onClick={incrementCounter}>
        inc
      </button>
      <button type="button" onClick={decrementCounter}>
        dec
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
