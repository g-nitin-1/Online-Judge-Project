import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getStoredUser } from "../utils/session";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

  const logout = () => {
    localStorage.removeItem("UserData");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">OnlineJudge</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/questions">Questions</Link>
            </li>
          </ul>
          {user ? (
            <div className="navbar-nav ms-auto align-items-lg-center">
              <Link className="nav-link" to="/dashboard">{user.name || user.email}</Link>
              <button className="btn btn-link nav-link" type="button" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="navbar-nav ms-auto">
              <Link className="nav-link" to="/register">Register</Link>
              <Link className="nav-link" to="/login">Login</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
