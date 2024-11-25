import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (userData, token) => {
        console.log("Redirecting to Login...");
        if (token) {
            setIsAuthenticated(true);
            setUser(userData);
            setToken(token);
            localStorage.setItem('accessToken', token);
            console.log("User authenticated.");
        } else {
            console.error("No valid token found.");
        }
    };

    const logout = () => {
        console.log("Logging out...");
        setUser(null);
        setToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        setIsAuthenticated(false);
        console.log("...logged out successfully!!");
    };

    const setError = (error) => {
        console.error("Error: ", error);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("Error: useAuth must be used within an AuthProvider");
    }
    return context;
};