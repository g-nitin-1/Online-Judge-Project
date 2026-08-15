import './App.css';
import NavBar from './Components/NavBar';
import React, { lazy, Suspense } from "react";
import { BrowserRouter ,Routes , Route } from "react-router-dom";
import { Authentication } from './utils/Authentication';

const Home = lazy(() => import('./Components/Home'));
const Login = lazy(() => import('./Components/Login'));
const Register = lazy(() => import('./Components/Register'));
const QuestionsUser = lazy(() => import('./Components/QuestionsUser'));
const Dashboard = lazy(() => import('./Components/Dashboard'));
const Editor = lazy(() => import('./Components/Editor'));
function App() {
  return (
    <div className="App" >
<BrowserRouter>
      <NavBar/>
      <Suspense fallback={<div className="text-center mt-5">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/questions" element={<QuestionsUser/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={<Authentication><Dashboard/></Authentication>} />
        <Route path="/register" element={<Register/>} />  
        <Route path="/question/:uniquename" element={<Authentication><Editor/></Authentication>} />
      </Routes>
      </Suspense>
</BrowserRouter>
    </div>
  );
}

export default App;
