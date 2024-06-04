import React from "react";
import { Link } from "react-router-dom"


import "./LoginNavigation.css";

const ForgotPasswordNavigation = props => {
    return <header className="login-nav">
        <Link to="/login">← Quay lại</Link>
        {/* <Link to="/signup">Create an account</Link> */}
    </header>
};

export default ForgotPasswordNavigation;