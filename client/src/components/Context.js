import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
    const [user, setUser ] = useState(null); //check authentication of (user/professor)
    const [loggedIn, setLoggedIn ] = useState(false); // track if user login status
    const [error, setError ] = useState(null); // State for errors 

//Auto-login when app starts or when user login 
useEffect(() => {
    fetch("/check_session", { credentials: "include" })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Not authenticated");
        })
        .then((data) => {
            if (data?.id) {
                setUser(data);
                setLoggedIn(true);
            }
        })
        .catch((error) => {
            setError(error.message);
            setLoggedIn(false);
        })
}, [])

const login = (credentials) => {
    return fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
    })
        .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Login failed");
        })
        .then((userData) => {
            return fetch("/check_session", {credentials: "include" })
            .then((res) => res.json())
            .then((sessionData) => {
                setUser(sessionData);
                setLoggedIn(true);
                setError(null);
                });
            })
            .catch((error) => {
                setError(error.message);
                throw error;
            });
};

const logout = () => {
    fetch ("/logout", {
        method: "POST",
    })
        .then((response) => {
            if (response.ok ) {
                setUser(null);
                setLoggedIn(false);
                setError(null);
            } else {
                throw new Error("Failed to logout");
            }
        })
        .catch((error) => {
            setError(error.message);
            console.error("Logout error", error);
        });
};

return (
    <UserContext.Provider
        value = {{
        user,
        loggedIn,
        error,
        login,
        logout,
    }} >
        {children}
    </UserContext.Provider>
);
}

export { UserContext, UserProvider };