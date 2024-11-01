import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (userData, token) => {
        setIsAuthenticated(true);
        setUser(userData);
        setToken(token);
        localStorage.setItem('accessToken', token);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem('accessToken');
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