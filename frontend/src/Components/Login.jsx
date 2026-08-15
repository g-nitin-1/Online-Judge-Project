import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Style.css";
import bg from "./images/Homepage_bg.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      localStorage.setItem("UserData", JSON.stringify(data));
      navigate("/questions");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to log in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid bg" style={{backgroundImage: `url(${bg})`}}>
      <ToastContainer position="top-right" />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-sm-8 col-lg-6">
            <div className="card">
              <h1>Login</h1>
              <div className="card-body">
                <form onSubmit={submit}>
                  <div className="form-group">
                    <label htmlFor="login-email">Email</label>
                    <input id="login-email" type="email" className="form-control" value={email} onChange={event => setEmail(event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input id="login-password" type="password" className="form-control" value={password} onChange={event => setPassword(event.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-dark" disabled={submitting}>
                    {submitting ? "Logging in…" : "Login"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
