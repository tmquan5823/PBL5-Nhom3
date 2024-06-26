import React, { useContext } from "react";
import "./SideBar.css";
import Cookies from "js-cookie";
import { useHttpClient } from "../../hooks/http-hook";
import LoadingSpinner from "../UIElements/LoadingSpinner";
import { AuthContext } from "../../context/auth-context";

const SideBar = props => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const auth = useContext(AuthContext);

    async function logoutHandler(event) {
        event.preventDefault();
        try {
            const resData = await sendRequest(process.env.REACT_APP_URL + "/api/auth/log-out", "POST", null, {
                'Authorization': "Bearer " + auth.token
            });
            if (resData.state) {
                auth.logout();
            }
        } catch (err) {
            console.log(err);
        }
    }

    return <React.Fragment>
        {isLoading && <LoadingSpinner asOverlay />}
        <aside className={`${auth.role === 'admin' & "admin-sidebar"} side-bar`}>
            {props.children}
            <a href="/home" className="signout-btn">
                <button onClick={logoutHandler}>
                    <div className="signout-btn__content">
                        <p>Đăng xuất</p>
                        <img src="/images/logout.png" alt="" />
                    </div>
                </button>
            </a>
        </aside>
    </React.Fragment>
};

export default SideBar;