import React, { useState, useEffect } from 'react';

function FlashMessage() {
    const [flash, setFlash] = useState({ message: '', type: '' });

    useEffect(() => {
        const storedMessage = sessionStorage.getItem('flashMessage');
        if (storedMessage) {
            setFlash(JSON.parse(storedMessage));
            setTimeout(() => {
                sessionStorage.removeItem('flashMessage');
                setFlash({ message: '', type: '' });
            }, 5000); // Remove message after 5 seconds
        }
    }, []);

    if (!flash.message) return null;

    const flashMessageStyle = {
        width: '90%',
        maxWidth: '600px',
        margin: '10px auto',
        padding: '10px 20px',
        borderRadius: '5px',
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        boxSizing: 'border-box',
        transition: 'opacity 0.5s ease',
        backgroundColor: flash.type === 'success' ? 'green' : 'red', // Green for success, Red for error
    };

    return (
        <div className="flash-message" style={flashMessageStyle}>
            <p>{flash.message}</p>
        </div>
    );
}

export default FlashMessage;