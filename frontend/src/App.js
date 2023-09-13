import './App.css';
import NavBar from './Components/NavBar';
import React from "react";
import { BrowserRouter ,Routes , Route } from "react-router-dom";
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import QuestionsUser from './Components/QuestionsUser';
import { Authentication } from './utils/Authentication';
import SampleCompiler from './Components/SampleCompiler';
import Dashboard from './Components/Dashboard';
import Editor from './Components/Editor';
function App() {
  return (
    <div className="App" >
      <NavBar/>
<BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/questions" element={<QuestionsUser/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={Authentication(<Dashboard/>)} />
        <Route path="/register" element={<Register/>} />  
        <Route path="/SampleCompiler" element={<SampleCompiler/>} />
        <Route path="/Editor" element={<Editor/>} />
      </Routes>
</BrowserRouter>
    </div>
  );
}

export default App;
