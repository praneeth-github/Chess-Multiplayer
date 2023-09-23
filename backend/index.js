const { Server } = require("socket.io");
// import {chess} from "chess"
const { Chess } = require("chess.js")

const io = new Server(8000, {
    cors: true,
})

const socketIdToUsername = new Map();
const usernameToSocketId = new Map();

const socketIdToRoomId = new Map();

const roomIdToChessGame = new Map();

// const chess = new Chess()

io.on("connection", (socket) => {
    console.log("New user connected ", socket.id);

    socket.on("roomJoin", ({ username, roomId }) => {
        socketIdToUsername.set(socket.id, username);
        usernameToSocketId.set(username, socket.id);
        io.to(roomId).emit("newUserJoined", { username, id: socket.id });
        socket.join(roomId);
        socketIdToRoomId.set(socket.id, roomId);
        const chess = new Chess()
        roomIdToChessGame.set(roomId, chess)
    })

    socket.on("user:inroom", ({ to, id }) => {
        io.to(to).emit("user:inroom", { from: socket.id, id: id, user: socketIdToUsername.get(id) });
    })



    // const chess = new Chess()

    // while (!chess.isGameOver()) {
    //     // const moves = chess.moves()
    //     // const move = moves[Math.floor(Math.random() * moves.length)]
    //     chess.move("wPe2-e4");
    //     chess.move("bPe7-e5");
    //     chess.move("wBf1-c4");
    //     chess.move("bPa7-a6");
    //     chess.move("wQd1-f3");
    //     chess.move("bPb7-b5");
    //     chess.move("wQf3-f7");
    // }
    // console.log(chess.pgn())



    socket.on("user:move", ({ to, source, target, piece, newPos, oldPos }) => {
        move = piece + source + "-" + target;
        console.log(move);
        const chess = roomIdToChessGame.get(socketIdToRoomId.get(socket.id));
        try {
            chess.move(move);
            if(chess.isGameOver())
            {
                let gameStatus = "";
                if(chess.isCheckmate())
                {
                    gameStatus = "Checkmate";
                }
                else if(chess.isDraw() || chess.isThreefoldRepetition())
                {
                    gameStatus = "Draw"
                }
                else if(chess.Stalemate())
                {
                    gameStatus = "Stalemate"
                }

                io.to(to).emit("opponent:move:gameend",{from: socket.id, source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos, gameStatus: gameStatus})
                io.to(socket.id).emit("gameend", {gameStatus: gameStatus})
            }
            else
            {
                io.to(to).emit("opponent:move", { from: socket.id, source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos })
            }
        } catch (error) {
            console.log("hi Error: ",error);
            io.to(socket.id).emit("invalid:move",{source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos})
        }
        // console.log(move);
        // const chess = roomIdToChessGame.get(socketIdToRoomId.get(socket.id));
        // chess.move(move);
        // if(chess.isGameOver())
        // {
        //     let gameStatus = "";
        //     if(chess.isCheckmate())
        //     {
        //         gameStatus = "Checkmate";
        //     }
        //     else if(chess.isDraw() || chess.isThreefoldRepetition())
        //     {
        //         gameStatus = "Draw"
        //     }
        //     else if(chess.Stalemate())
        //     {
        //         gameStatus = "Stalemate"
        //     }

        //     io.to(to).emit("opponent:move:gameend",{from: socket.id, source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos, gameStatus: gameStatus})
        //     io.to(socket.id).emit("gameend", {gameStatus: gameStatus})
        // }
        // else
        // {
        //     io.to(to).emit("opponent:move", { from: socket.id, source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos })
        // }

    })

})