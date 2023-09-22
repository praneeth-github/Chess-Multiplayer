import { useEffect, useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chessboard from "chessboardjs"
import ChessboardComponent from "./components/chesscomponent"
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import LandingPage from './components/landingPage'

function App() {


  

  return (
    <>
      {/* <div id="myBoard" style="width: 400px"></div> */}
      <Router>
        <Routes>
          <Route exact path="/" element = {<LandingPage></LandingPage>}></Route>
          <Route path="/room/:id" element = {<ChessboardComponent></ChessboardComponent>}></Route>
        </Routes>
      </Router>
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
