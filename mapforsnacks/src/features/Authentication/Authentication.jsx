import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('userData');
        
        // Check if storedUser is valid JSON
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing userData from localStorage:', error);
            }
        }
    }, []);
    

    const login = (userData, token) => {
        console.log("Redirecting to Login...");
        if (token) {
            setIsAuthenticated(true);
            setUser(userData);
            setToken(token);
            localStorage.setItem('accessToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
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