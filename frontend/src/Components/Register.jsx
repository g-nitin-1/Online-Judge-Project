import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Style.css";
import bg from "./images/Homepage_bg.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async event => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, form);
      localStorage.setItem("UserData", JSON.stringify(data));
      navigate("/questions");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to register");
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
              <h1>Register</h1>
              <div className="card-body">
                <form onSubmit={submit}>
                  <div className="form-group">
                    <label htmlFor="register-name">Name</label>
                    <input id="register-name" name="name" className="form-control" value={form.name} onChange={update} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="register-email">Email</label>
                    <input id="register-email" name="email" type="email" className="form-control" value={form.email} onChange={update} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="register-password">Password</label>
                    <input id="register-password" name="password" type="password" minLength="8" className="form-control" value={form.password} onChange={update} required />
                  </div>
                  <button type="submit" className="btn btn-dark" disabled={submitting}>
                    {submitting ? "Creating account…" : "Register"}
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

export default Register;
