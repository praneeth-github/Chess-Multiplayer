const {Server} = require("socket.io")
// import {chess} from "chess";

const io = new Server(8000,{
    cors:true,
})

const socketIdToUsername = new Map();
const usernameToSocketId = new Map();

io.on("connection", (socket) => {
    console.log("New user connected ",socket.id);

    socket.on("roomJoin",({username,roomId}) => {
        socketIdToUsername.set(socket.id,username);
        usernameToSocketId.set(username,socket.id);
        io.to(roomId).emit("newUserJoined", {username, id: socket.id});
        socket.join(roomId);
    })

    socket.on("user:inroom", ({to,id}) =>{
        io.to(to).emit("user:inroom", { from: socket.id, id: id, user: socketIdToUsername.get(id)});
    })




    // const gameServer = chess.create();

})