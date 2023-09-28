import React, { useCallback, useEffect, useRef } from "react";
import { ChessBoard } from "chessboardjs";
import { useState } from "react";
import { useSocket } from "../context/SocketProvider";


const ChessboardComponent = () => {
  const boardRef = useRef(null);
  const [allowMyself, setAllowMyself] = useState(false)
  const [orientation, setOrientation] = useState("white")
  const [position, setPosition] = useState("start")
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState("")
  const [result, setResult] = useState("")
  const [pgn, setPgn] = useState("")
  // const [isCastle, setIsCastle] = useState(false)
  // const [isLongCastle, setIsLongCastle] = useState(false)


  const [remoteSocketId, setRemotesocketId] = useState()
  const [remoteUsername, setRemoteUsername] = useState()

  const socket = useSocket()

  function onDragStart(source, piece, position, orientation) {
    if ((orientation === 'white' && piece.search(/^w/) === -1) ||
      (orientation === 'black' && piece.search(/^b/) === -1) ||
      (!allowMyself)) {
      return false
    }
  }

  // const onDragStart = useCallback(({ source, piece, position, orientation }) => {
  //   console.log(allowMyself)
  //   if ((orientation === "white" && piece.search(/^w/) === -1) ||
  //     (orientation === "black" && piece.search(/^b/) === -1) ||
  //     (!allowMyself)) {
  //     return false
  //   }
  // }, [allowMyself]);

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
    // socket.emit("user:move:castle",{to: remoteSocketId, newPos: newPos, oldPos: oldPos})
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
    // console.log("castle: ",isCastle)

    // if(isCastle)
    // {
    //   if(orientation == "white")
    //   {
    //     console.log("white castling")
    //     board.move("h1-f1")
    //   }
    //   else
    //   {
    //     console.log("black castling")
    //     board.move("h8-f8")
    //   }
    //   setIsCastle(false)
    // }

    // if(isLongCastle)
    // {
    //   if(orientation == "white")
    //   {
    //     console.log("white long castling")
    //     board.move("a1-d1")
    //   }
    //   else
    //   {
    //     console.log("black long castling")
    //     board.move("a8-d8")
    //   }
    //   setIsLongCastle(false)
    // }

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
    ({ from, source, target, piece, newPos, oldPos, pgn }) => {
      // console.log("psjkdnjksd",newPos);
      // board.position(newPos)
      setPgn(pgn)
      setPosition(newPos)
      setAllowMyself(true)
    },
    [],
  )

  const handleOpponentGameEnd = useCallback(
    ({ from, source, target, piece, newPos, oldPos, gameStatus, pgn }) => {
      // board.position(newPos)
      setPgn(pgn)
      setPosition(newPos)
      setGameOver(true);
      setResult(gameStatus)
      setAllowMyself(false);
      if(gameStatus == "Checkmate")
      {
        setWinner("You Lose")
      }
      else if(gameStatus == "Resign")
      {
        setWinner("You Win")
      }
      else
      {
        setWinner("Draw")
      }
    },
    [],
  )

  const handleGameEnd = useCallback(
    ({gameStatus }) => {
      setGameOver(true);
      setResult(gameStatus)
      setAllowMyself(false);
      if(gameStatus == "Checkmate")
      {
        setWinner("You Win")
      }
      else if(gameStatus == "Resign")
      {
        setWinner("You Lose")
      }
      else
      {
        setWinner("Draw")
      }
    },
    [],
  )

  const handleInvalidMove = useCallback(
    ({source, target, piece, newPos, oldPos, pgn}) => {
      // board.position(newPos)
      alert("Invalid Move");
      setPgn(pgn)
      setPosition(oldPos)
      setAllowMyself(true)
    },
    [],
  )

  const handleCastleEnpassant = useCallback(
    ({source, target, piece, newPos, oldPos, newnewPos, pgn}) => {
      // setIsCastle(true);
      setPgn(pgn)
      setPosition(newnewPos);
    },
    [],
  )

  // const handleLongCastle = useCallback(
  //   ({source, target, piece, newPos, oldPos}) => {
  //     setIsLongCastle(true);
  //     setPosition(newPos);
  //   },
  //   [],
  // )

  const handleAskPromotionPiece = useCallback(
    ({source, target, piece, newPos, oldPos}) => {
      //Q,K,B,R
      const promotePiece = prompt("Please Enter the Promote Piece (Queen(Q), Knight(K), Bishop(B), Rook(R)","Q")
      // console.log(orientation,allowMyself)
      // console.log(remoteSocketId)
      socket.emit("selectedPromotePiece",{to: remoteSocketId, source: source, target: target, piece: piece, newPos: newPos, oldPos: oldPos, promotePiece: promotePiece})
    },
    [remoteSocketId],
  )

  // const handleOpponentAfterPromotion = useCallback(
  //   ({ from, source, target, piece, newPos, oldPos }) => {
  //     console.log("psjkdnjksd",newPos);
  //     // board.position(newPos)
  //     setPosition(newPos)
  //     setAllowMyself(true)
  //   },
  //   [],
  // )

  const handleResign = useCallback(
    () => {
      socket.emit("userResign", {to: remoteSocketId})
    },
    [remoteSocketId],
  )

  const handleRequestDraw = useCallback(
    () => {
      socket.emit("userRequestDraw", {to: remoteSocketId})
      alert("Request for Draw sent")
    },
    [remoteSocketId],
  )

  const handleOpponentReqDraw = useCallback(
    ({from}) => {
      if(confirm("Opponent Requested for Draw, Accept?"))
      {
        socket.emit("userAcceptDraw", {to: remoteSocketId})
      }
      else
      {
        socket.emit("userRejectDraw", {to: remoteSocketId})
      }
    },
    [remoteSocketId],
  )

  const handleOpponentRejectDraw = useCallback(
    ({from}) => {
      alert("Opponent Rejected your Draw Request");
    },
    [],
  )

  const handleRequestUndo = useCallback(
    () => {
      socket.emit("userRequestUndo", {to: remoteSocketId, orientation: orientation})
      alert("Request for Undo sent")
    },
    [remoteSocketId],
  )

  const handleOpponentReqUndo = useCallback(
    ({from}) => {
      if(confirm("Opponent Requested for Undo, Accept?"))
      {
        socket.emit("userAcceptUndo", {to: remoteSocketId, orientation: orientation})
      }
      else
      {
        socket.emit("userRejectUndo", {to: remoteSocketId})
      }
    },
    [remoteSocketId],
  )

  const handleOpponentAcceptUndo = useCallback(
    ({from, newPos, pgn}) => {
      setPgn(pgn)
      setPosition(newPos);
      setAllowMyself(true);
    },
    [],
  )

  const handleYouAcceptUndo = useCallback(
    ({from, newPos, pgn}) => {
      setPgn(pgn)
      setPosition(newPos);
    },
    [],
  )

  const handleOpponentRejectUndo = useCallback(
    () => {
      alert("Opponent Rejected your Undo Request");
    },
    [],
  )

  const handleUpdatePgn = useCallback(
    ({pgn}) => {
      setPgn(pgn)
    },
    [],
  )

  const handleCantUndo = useCallback(
    () => {
      alert("Please move before undo")
    },
    [],
  )


  useEffect(() => {
    socket.on("newUserJoined", handleUserJoined)
    socket.on("user:inroom", handleInRoomUser);
    socket.on("opponent:move", handleOpponentMove);
    socket.on("opponent:move:gameend", handleOpponentGameEnd);
    socket.on("gameend", handleGameEnd);
    socket.on("invalid:move", handleInvalidMove);
    socket.on("castle:enpassant", handleCastleEnpassant);
    // socket.on("longCastle", handleLongCastle);
    socket.on("promotionPiece", handleAskPromotionPiece);
    // socket.on("afterPromotion", handleAfterPromotion);
    // socket.on("opponent:move:afterPromotion", handleOpponentAfterPromotion);
    socket.on("opponentRequestDraw", handleOpponentReqDraw);
    socket.on("opponentRejectDraw", handleOpponentRejectDraw);
    socket.on("opponentRequestUndo", handleOpponentReqUndo);
    socket.on("opponentAcceptUndo", handleOpponentAcceptUndo);
    socket.on("youAcceptUndo", handleYouAcceptUndo);
    socket.on("opponentRejectUndo", handleOpponentRejectUndo);
    socket.on("updatePgn", handleUpdatePgn);
    socket.on("cantUndo", handleCantUndo);
    return () => {
      socket.off("newUserJoined", handleUserJoined)
      socket.off("user:inroom", handleInRoomUser);
      socket.off("opponent:move", handleOpponentMove);
      socket.off("opponent:move:gameend", handleOpponentGameEnd);
      socket.off("gameend", handleGameEnd);
      socket.off("invalid:move", handleInvalidMove);
      socket.off("castle:enpassant", handleCastleEnpassant);
      // socket.off("longCastle", handleLongCastle);
      socket.off("promotionPiece", handleAskPromotionPiece);
      // socket.off("afterPromotion", handleAfterPromotion);
      // socket.off("opponent:move:afterPromotion", handleOpponentAfterPromotion);
      socket.off("opponentRequestDraw", handleOpponentReqDraw);
      socket.off("opponentRejectDraw", handleOpponentRejectDraw);
      socket.off("opponentRequestUndo", handleOpponentReqUndo);
      socket.off("opponentAcceptUndo", handleOpponentAcceptUndo);
      socket.off("youAcceptUndo", handleYouAcceptUndo);
      socket.off("opponentRejectUndo", handleOpponentRejectUndo);
      socket.off("updatePgn", handleUpdatePgn);
      socket.off("cantUndo", handleCantUndo);
    }
  }, [handleUserJoined, handleInRoomUser, handleOpponentMove,handleOpponentGameEnd, handleGameEnd, handleInvalidMove, handleCastleEnpassant, 
    handleAskPromotionPiece, handleOpponentReqDraw, handleOpponentRejectDraw, handleOpponentReqUndo, handleOpponentAcceptUndo, handleYouAcceptUndo, 
    handleOpponentRejectUndo, handleUpdatePgn, handleCantUndo])
  return (
    <div>
      <b>Oppponent: {remoteUsername}</b>
      <p/>
      <div ref={boardRef} style={{ margin: "auto", padding: "10px", width: "400px"}}></div>
      <p/>
      <button disabled={gameOver} onClick={handleRequestUndo}>Undo</button>
      <button disabled={gameOver} onClick={handleRequestDraw}>Request for a Draw</button>
      <button disabled={gameOver} onClick={handleResign}>Resign</button>
      <p>{allowMyself ? "Your Turn" : (gameOver? "" : "Waiting for opponent")}</p>
      <p>{gameOver? "Game Over" : ""}</p>
      <p>{winner}  {result}</p>
      <p>{pgn}</p>
    </div>
  )
}

export default ChessboardComponent;