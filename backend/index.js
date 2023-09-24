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

    // // while (!chess.isGameOver()) {
    //     // const moves = chess.moves()
    //     // const move = moves[Math.floor(Math.random() * moves.length)]
    //     chess.move("wPe2-e4");
    //     chess.move("bPe7-e5");
    //     const w = chess.move("wNg1-f3");
    //     chess.move("bNb8-c6");
    //     chess.move("wPd2-d4");
    //     chess.move("bPe5-d4");
    //     chess.move("wPe4-e5");
    //     chess.move("bPd7-d5");
    //     const q = chess.move("wPe5-d6");
    //     chess.move("bQd8-h4")
    //     chess.move("wPd6-d7")
    //     chess.move("bKe8-e7")
    //     const k = chess.move("wPd7-d8=Q")
    //     console.log(w)
    //     console.log(q)
    //     console.log(k)
    //     // if(q.san == "O-O")
    //     // {
    //     //     console.log("hi")
    //     // }
    // // }
    // console.log(chess.pgn())



    socket.on("user:move", ({ to, source, target, piece, newPos, oldPos }) => {
        move = piece + source + "-" + target;
        console.log(move);
        const chess = roomIdToChessGame.get(socketIdToRoomId.get(socket.id));
        try {
            const moveConfirm = chess.move(move);
            if(moveConfirm.san == "O-O" || moveConfirm.san == "O-O-O")
            {
                io.to(socket.id).emit("castle",{source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos, newnewPos: moveConfirm.after})
                io.to(to).emit("opponent:move", { from: socket.id, source: source, target: target, piece: piece, newPos: moveConfirm.after, oldPos: oldPos })
            }
            // else if(moveConfirm.san == "O-O-O")
            // {
            //     io.to(socket.id).emit("longCastle",{source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos})
            // }
            else
            {
                if(chess.isGameOver())
                {
                    let gameStatus = "";
                    if(chess.isCheckmate())
                    {
                        gameStatus = "Checkmate";
                    }
                    else if(chess.isDraw() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial())
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

    // socket.on("user:move:castle",({to, newPos, oldPos}) => {
    //     io.to(to).emit("opponent:move", { from: socket.id, newPos: newPos, oldPos: oldPos })
    // })

})