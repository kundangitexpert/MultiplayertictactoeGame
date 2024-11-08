import React, { useEffect, useState } from "react";
import "./App.css";
import Square from "./Square/Square";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

const renderForm = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const App = () => {
  const [gamestate, setGamestate] = useState(renderForm);
  const [currentplayer, setcurrentplayer] = useState("circle");
  const [finishedstate, setfinishedstate] = useState(false);
  const [finishedarraystate, setfinishedarraystate] = useState([]);
  const [playonline, setplayonline] = useState(false);
  const [socket, setsocket] = useState(null);
  const [playerName, setplayername] = useState("");
  const [opponentname, setopponentname] = useState(null);
  const [playingAs, setplayingAs] = useState(null);

  const checkwinner = () => {
    // row dynamic
    for (let row = 0; row < gamestate.length; row++) {
      if (
        gamestate[row][0] === gamestate[row][1] &&
        gamestate[row][1] === gamestate[row][2]
      ) {
        setfinishedarraystate([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gamestate[row][0];
      }
    }
    // column dynamic

    for (let col = 0; col < gamestate.length; col++) {
      if (
        gamestate[0][col] === gamestate[1][col] &&
        gamestate[1][col] === gamestate[2][col]
      ) {
        setfinishedarraystate([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gamestate[0][col];
      }
    }
    // diagonal dynamic
    if (
      gamestate[0][0] === gamestate[1][1] &&
      gamestate[1][1] === gamestate[2][2]
    ) {
      setfinishedarraystate([0, 4, 8]);
      return gamestate[0][0];
    }

    if (
      gamestate[0][2] === gamestate[1][1] &&
      gamestate[1][1] === gamestate[2][0]
    ) {
      setfinishedarraystate([2, 4, 6]);
      return gamestate[0][2];
    }
    const isDraw = gamestate.flat().every((e) => {
      if (e === "circle" || e === "cross") return true;
    });
    if (isDraw) {
      return "draw";
    }
    return null;
  };
  useEffect(() => {
    const winner = checkwinner();
    if (winner) {
      setfinishedstate(winner);
    }
  }, [gamestate]);

  const takeplayerName = async () => {
    return await Swal.fire({
      title: "Enter your Name",
      input: "text",

      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
  };

  socket?.on("opponentleftmatch", () => {
    alert("opponent left match!!!!");
    setfinishedstate("opponentleft");
  });

  socket?.on("playerMoveFromServer", (data) => {
    // console.log("got data from player move to server")

    const id = data.state.id;
    setGamestate((prevState) => {
      let newGameState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const columnIndex = Math.floor(id % 3);
      newGameState[rowIndex][columnIndex] = data.state.sign;

      return newGameState;
    });
    setcurrentplayer(data.state.sign == "circle" ? "cross" : "circle");
  });
  socket?.on("connect", function () {
    // alert("you are connected with backend")
    setplayonline(true);
  });

  socket?.on("OpponentNotFound", function () {
    // alert("you are connected with backend")
    setopponentname(false);
  });
  socket?.on("OpponentFound", function (data) {
    // alert("you are connected with backend")
    // console.log(data);
    setplayingAs(data.playingAs);
    setopponentname(data.opponentname);
  });

  const playonlineclick = async () => {
    const result = await takeplayerName();
    if (!result.isConfirmed) {
      return;
    }
    const username = result.value;
    setplayername(username);
    const newsocket = io("http://localhost:3000", {
      autoConnect: true,
    });
    newsocket?.emit("request_to_play", {
      playerName: username,
    });

    setsocket(newsocket);
  };

  if (!playonline) {
    return (
      <div className="main-div">
        {" "}
        <button onClick={playonlineclick} className="playonline">
          Play Online
        </button>
      </div>
    );
  }
  if (playonline && !opponentname) {
    return (
      <div className="waiting">
        <p> Waiting for an Opponent </p>
        <p className="dots">.....</p>
      </div>
    );
  }
  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentplayer === playingAs ? "current-move-" + currentplayer : ""
          }`}
        >
          {playerName}
        </div>
        <div
          className={`right ${
            currentplayer !== playingAs ? "current-move-" + currentplayer : ""
          }`}
        >
          {opponentname}
        </div>
      </div>
      <div>
        <h1 className="game-heading water-background">TIC TAC TOE</h1>
        <div className="square-wrapper">
          {gamestate.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              return (
                <Square
                  playingAs={playingAs}
                  gamestate={gamestate}
                  socket={socket}
                  finishedstate={finishedstate}
                  currentplayer={currentplayer}
                  finishedarraystate={finishedarraystate}
                  setcurrentplayer={setcurrentplayer}
                  setGamestate={setGamestate}
                  id={rowIndex * 3 + colIndex}
                  key={rowIndex * 3 + colIndex}
                  currentElement={e}
                />
              );
            })
          )}
        </div>
        {finishedstate &&
          finishedstate !== "opponentleftmatch" &&
          finishedstate !== "draw" && (
            <h3 className="finished-state">
              {finishedstate === playingAs ? "You Won the Game" : finishedstate !== playingAs ? "You loss the Game":""} 
            </h3>
          )}
        {finishedstate &&
          finishedstate !== "opponentleftmatch" &&
          finishedstate === "draw" && (
            <h3 className="finished-state">MATCH DRAW </h3>
          )}
      </div>
      {!finishedstate && opponentname && (
        <h2>You are Playing against {opponentname}</h2>
      )}

      {finishedstate && finishedstate==="opponentleftmatch" && (
        <h2>You won the match cause Opponent left !!! </h2>
      )}
    </div>
  );
};

export default App;

// UPDATED CODE FROM GPT ---------->>>>>>>>>>>>>
