// // import { createServer } from "http";
// // import { Server } from "socket.io";
// const {createServer} = require("http");
// const {Server} = require("socket.io");

// const httpServer = createServer();
// const io = new Server(httpServer, {
//   cors : "http://localhost:5173/",
// });
// const allusers={}
// io.on("connection", (socket) => {
  
//   allusers[socket.id]={
//     socket:socket,
//     online:true,
//   }
//   socket.on("request_to_play",(data)=>{
//     const currentUser=allusers[socket.id]
//     currentUser.playerName=data.playerName;
//     // console.log(currentUser)
//     let opponentplayer;
//     for(let id in allusers){
//       const user=allusers[id];
//       if(user.online && !user.playing && socket.id !== id)
//       {
//         opponentplayer=user;
//         break;
//       }
//     }
//     console.log(opponentplayer);
//     if(opponentplayer)
//     {
//       console.log("OPPONENT FOUND");

//     }
//     else{
//       console.log("opponent not found");
//     }
//   })
//   socket.on("disconnect",function(){
//    allusers[socket.id]={
//     socket:{...socket,online:false},
//     online:true,
//    }
//   })
//   // console.log("new user joined "+ socket.id);
  
// });

// httpServer.listen(3000);


const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:5173/",
});

const allusers = {};
const allrooms=[];

io.on("connection", (socket) => {
 
  // Initialize the user as online and not playing
  allusers[socket.id] = {
    socket: socket,
    online: true,
    playing: false,  // Track whether the user is playing or not
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allusers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentplayer;

    for (let id in allusers) {
      const user = allusers[id];
      // Check if the user is online and not playing, and make sure it's not the same user
      if (user.online && !user.playing && socket.id !== id) {
        opponentplayer = user;
        break;
      }
    }

    if (opponentplayer) {
      allrooms.push({
        player1: opponentplayer,
        player2:currentUser,
      });
      // Opponent found
      // console.log("OPPONENT FOUND");
      opponentplayer.socket.emit("OpponentFound",{
        opponentname:currentUser.playerName,
        playingAs: "circle",

      })
      currentUser.socket.emit("OpponentFound",{
        opponentname:opponentplayer.playerName,
        playingAs: "cross",

      })

      currentUser.socket.on("playerMoveFromClient",(data)=>{
        opponentplayer.socket.emit("playerMoveFromServer",{
        ...data,
        // gamestate: data.gamestate,
        })
      })
      opponentplayer.socket.on("playerMoveFromClient",(data)=>{
        currentUser.socket.emit("playerMoveFromServer",{
          ...data,
          // gamestate: data.gamestate,
        })
      })

      // Set both players as playing
      currentUser.playing = true;
      opponentplayer.playing = true;

      // You can emit events to start the game, if needed
      // socket.emit('opponent_found', { opponent: opponentplayer.playerName });
      // opponentplayer.socket.emit('opponent_found', { opponent: currentUser.playerName });

    } else {
      // Opponent not found
      // console.log("opponent not found");
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnect", function () {
    // Mark user as offline when they disconnect
    allusers[socket.id].online = false;
    allusers[socket.id].playing = false; 
    
    // Mark user as not playing
    // currentUser.playing=false;
    for (let index = 0; index < allrooms.length; index++) {
      const {player1,player2} = allrooms[index];
if(player1.socket.id===socket.id)
{
player2.socket.emit("opponentleftmatch")
break;

}
if(player2.socket.id===socket.id)
{
player1.socket.emit("opponentleftmatch")
break;
}
      
    }
  });
});

httpServer.listen(3000);




