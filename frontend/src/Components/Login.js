import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Style.css'
import bg from './images/Homepage_bg.jpg';


const Login = () => {
  return (
    <div class="container-fluid bg" style={{backgroundImage:`url(${bg})`}}>
      <ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
/>
{/* Same as */}
<ToastContainer />
<div class="container mt-5">


  <div class="row">
    <div class="col-sm-8">
      <div class="card">
      <h1>Login</h1>
        <div class="card-body">
          <form action="http://localhost:5000/login" method="POST">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" class="form-control" name="username"/>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" class="form-control" name="password"/>
            </div>
            <button type="submit" class="btn btn-dark">Login</button>
          </form>

        </div>
      </div>
    </div>
    <div class="col-sm-4">
      <div class="card">
        <div class="card-body">
        <a href="/auth/google">
          <button type="button" class="ht col-sm-10 btn-block btn-social btn-google">
          <i class="fab fa-google"></i> 
              login with Google
            </button>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
  );
};
export default Login