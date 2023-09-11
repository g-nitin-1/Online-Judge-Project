import React from 'react'
import { useNavigate } from "react-router-dom";
import './Style.css'
import bg from './images/Homepage_bg.jpg';

const Home = () => {


    const nav = useNavigate()
  return (
   <div className="jumbotron text-center text-white bg" style={{backgroundImage:`url(${bg})`}}>
   <div className="mt-5">
   <h1>Online Judge</h1>
    <p>Built with React, Node.js, Express and Webpack.</p>
    <hr /> 
    <button onClick={()=>nav('/Editor')} className='btn btn-danger'>Go To Questions</button>
   </div>
  </div>
  )
}

export default Home