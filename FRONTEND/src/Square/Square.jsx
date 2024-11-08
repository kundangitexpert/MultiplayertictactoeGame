import React, { useDeferredValue, useState } from "react";
import "./Square.css";

const circleSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const Square = ({
  playingAs,
  currentElement,
  gamestate,
  socket,
  setGamestate,
  finishedarraystate,
  setfinishedstate,
  finishedstate,
  id,
  currentplayer,
  setcurrentplayer,
}) => {
  const [icon, seticon] = useState(null);
  const clickOnSquare = () => {
    if(playingAs !== currentplayer)
    {
      return;
    }
    if (finishedstate) return;
    if (icon === null) {
      if (currentplayer == "circle") {
        seticon(circleSvg);
      } else {
        seticon(crossSvg);
      }
      const mycurrentPlayer = currentplayer;
      socket.emit("playerMoveFromClient", {
        state: {
          id,
          sign: mycurrentPlayer,
        },
      });
      setcurrentplayer(currentplayer === "circle" ? "cross" : "circle");

      setGamestate((prevState) => {
        let newGameState = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const columnIndex = Math.floor(id % 3);
        newGameState[rowIndex][columnIndex] = mycurrentPlayer;

        return newGameState;
      });
    }
  };
  return (
    <div
      className={`square ${finishedstate ? "not-allowed" : ""}
      ${currentplayer !== playingAs ? "not-allowed" : ""}
      
      ${
        finishedarraystate.includes(id) ? finishedstate + "-won" : ""
      }
      ${finishedstate && finishedstate !== playingAs ? "grey-background" : ""}`}
      onClick={clickOnSquare}
    >
      { currentElement === "circle" ? circleSvg : currentElement === "cross" ? crossSvg :  icon }
    </div>
  );
};

export default Square;



