import React, { useCallback, useEffect, useRef } from "react";
import { ChessBoard } from "chessboardjs";
import { useState } from "react";
import { useSocket } from "../context/SocketProvider";


const ChessboardComponent = () => {
  const boardRef = useRef(null);
  const [allowMyself, setAllowMyself] = useState(false)
  const [orientation, setOrientation] = useState("white")
  const [position, setPosition] = useState("start")


  const [remoteSocketId, setRemotesocketId] = useState()
  const [remoteUsername, setRemoteUsername] = useState()

  const socket = useSocket()

  // function onDragStart(source, piece, position, orientation) {
  //   if ((orientation === 'white' && piece.search(/^w/) === -1) ||
  //     (orientation === 'black' && piece.search(/^b/) === -1) ||
  //     (!allowMyself)) {
  //     return false
  //   }
  // }

  const onDragStart = useCallback(({ source, piece, position, orientation }) => {
    console.log(allowMyself)
    if ((orientation === 'white' && piece.search(/^w/) === -1) ||
      (orientation === 'black' && piece.search(/^b/) === -1) ||
      (!allowMyself)) {
      return false
    }
  }, [allowMyself]);

  // function onDragMove (newLocation, oldLocation, source,
  //   piece, position, orientation) {
  //     console.log('New location: ' + newLocation)
  //     console.log('Old location: ' + oldLocation)
  //     console.log('Source: ' + source)
  //     console.log('Piece: ' + piece)
  //     console.log('Position: ' + Chessboard.objToFen(position))
  //     console.log('Orientation: ' + orientation)
  //     console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  // }

  function onMoveEnd(oldPos, newPos) {
    console.log('Move animation complete:')
    console.log('Old position: ' + Chessboard.objToFen(oldPos))
    console.log('New position: ' + Chessboard.objToFen(newPos))
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    setAllowMyself(true);
  }

  function onDrop(source, target, piece, newPos, oldPos, orientation) {
    // if (piece.search(/b/) !== -1) {
    //   return 'snapback'
    // }
    if (target == "offboard" || source == target) {
      return 'snapback'
    }
    else {
      console.log('Source: ' + source)
      console.log('Target: ' + target)
      console.log('Piece: ' + piece)
      console.log('New position: ' + Chessboard.objToFen(newPos))
      console.log('Old position: ' + Chessboard.objToFen(oldPos))
      console.log('Orientation: ' + orientation)
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
      setPosition(newPos);
      setAllowMyself(false);

      socket.emit("user:move", { to: remoteSocketId, source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos })
    }
  }

  function onSnapbackEnd(piece, square, position, orientation) {
    console.log('Piece: ' + piece)
    console.log('Square: ' + square)
    console.log('Position: ' + Chessboard.objToFen(position))
    console.log('Orientation: ' + orientation)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  }

  var config = {
    draggable: true,
    dropOffBoard: 'snapback', // this is the default
    position: position,
    onDragStart: onDragStart,
    // onDragMove: onDragMove,
    onMoveEnd: onMoveEnd,
    onDrop: onDrop,
    onSnapbackEnd: onSnapbackEnd,
    orientation: orientation,
  }

  useEffect(() => {
    const board = Chessboard(boardRef.current, config);

    return () => {
      board.destroy();
    };
  }, [orientation, allowMyself, position]);

  const handleUserJoined = useCallback(({ username, id }) => {
    console.log(`Email ${username} joined room`);
    socket.emit('user:inroom', { to: id, id: socket.id })
    setRemotesocketId(id);
    setRemoteUsername(username);
    setAllowMyself(true);
  }, [socket]);

  const handleInRoomUser = useCallback(
    ({ from, id, user }) => {
      setRemotesocketId(id);
      setRemoteUsername(user);
      setOrientation("black")
    },
    [],
  )

  const handleOpponentMove = useCallback(
    ({ from, source, target, piece, newPos, oldPos }) => {
      // board.position(newPos)
      setPosition(newPos)
      setAllowMyself(true)
    },
    [],
  )


  useEffect(() => {
    socket.on("newUserJoined", handleUserJoined)
    socket.on("user:inroom", handleInRoomUser);
    socket.on("opponent:move", handleOpponentMove);
    return () => {
      socket.off("newUserJoined", handleUserJoined)
      socket.off("user:inroom", handleInRoomUser);
      socket.off("opponent:move", handleOpponentMove);
    }
  }, [handleUserJoined, handleInRoomUser, handleOpponentMove])
  return (
    <div>
      <div ref={boardRef} style={{ width: "400px" }}></div>
      <p>{remoteSocketId},{remoteUsername},{orientation},{allowMyself ? "Allowed" : "Not Allowed"}</p>
    </div>
  )
}

export default ChessboardComponent;