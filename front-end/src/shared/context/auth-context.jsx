import { createContext } from "react";

export const AuthContext = createContext({
    isLoggedIn: false,
    userID: null,
    token: null,
    avatarURL: null,
    login: () => { },
    logout: () => { }
})