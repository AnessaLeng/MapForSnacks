import React, { useState } from 'react';
import '../styles/Signup.css';
import '../styles/App.css';

function Signup() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        profile_image: null
    });

    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value, type, files } = event.target;
        setFormData({
            ...formData,
            [name]: type === 'file' ? files[0] : value
        });
    };

    const validate = () => {
        const newErrors = {};
        Object.keys(formData).forEach((field) => {
            if (!formData[field]) {
                newErrors[field] = `${field.replace('_', ' ')} is required.`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validate()) {
            const formData = new FormData();
            for (const key in formData) {
                formData.append(key, formData[key])
            }

            try {
                const response = await fetch('http://localhost:3000/signup', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (response.ok) {
                    console.log("User created successfully!");
                }
                else {
                    const errorData = await response.json();
                    console.error("Error creating user: ", errorData);
                }
            }
            catch (error) {
                console.error("Error: ", error);
            }
        }
    };

    return (
        <div className="signup-page">
            <section className="hero">
                <h1>Create an Account</h1>
            </section>
            <div className="signup-form">
            <form onSubmit={handleSubmit} method="POST" enctype="multipart/form-data">
                <div>
                    <input type="text" className="form-input" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required/>
                    {errors.first_name && <div className="error-message">{errors.first_name}</div>}
                </div><br/>
                <div>
                    <input type="text" className="form-input" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required/>
                    {errors.last_name && <div className="error-message">{errors.last_name}</div>}
                </div><br/>
                <div>
                    <input type="text" className="form-input" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required/>
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div><br/>
                <div>
                    <input type="password" className="form-input" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required/>
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div><br/>
                <div>
                <label htmlFor="profile_image" className="form-label">Profile Image: </label>
                    <input type="file" className="form-file" name="profile_image" onChange={handleChange} required/>
                    {errors.profile_image && <div className="error-message">{errors.profile_image}</div>}
                </div><br/>
                <button type="submit">Submit</button>
            </form>  
            </div>
        </div>
    );
}

export default Signup;