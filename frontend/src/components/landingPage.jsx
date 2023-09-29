import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LandingPage = () => {
    const [username, setusername] = useState("");
    const [roomId, setRoomId] = useState("");

    const socket = useSocket();

    const navigate = useNavigate();


    const handleSubmit = (e) => {
        e.preventDefault();
        socket.emit("roomJoin", { username, roomId })
        navigate(`/room/${roomId}`);
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <p>Enter Username</p>
                <input type="text"
                    value={username}
                    required
                    onChange={(e) => setusername(e.target.value)} />
                <br></br>
                <p>Enter RoomID</p>
                <input type="text"
                    value={roomId}
                    required
                    onChange={(e) => setRoomId(e.target.value)} />
                <br></br>
                <button type="submit">Submit</button>
            </form>
        </>
    )

}

export default LandingPage;