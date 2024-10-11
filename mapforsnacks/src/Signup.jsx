import React, {/* useEffect, useState */} from 'react';
//import { useAuth } from './Authentication';
//import { Navigate } from 'react-router-dom';
import './Signup.css';
import './App.css';

function Signup() {
    return (
        <div className="signup-page">
            <section className="hero">
                <h1>Create an Account</h1>
            </section>
            <div className="signup-form">
            <form action="/submit_form" method="post">
                <div>
                {/*   <label for="first_name" class="form-label">First Name</label><br/> */}
                    <input type="text" class="form-text" id="first_name" name="first_name" placeholder="First Name"/>
                </div><br/>
                <div>
                {/*    <label for="last_name" class="form-label">Last Name</label><br/> */}
                    <input type="text" class="form-text" id="last_name" name="last_name" placeholder="Last Name"/>
                </div><br/>
                <div>
                {/*    <label for="username" class="form-label">Username</label><br/> */}
                    <input type="text" class="form-text" id="username" name="username" placeholder="Username"/>
                </div><br/>
                <div>
                {/*    <label for="password" class="form-label">Password</label><br/> */}
                    <input type="password" class="form-password" id="password" name="password" placeholder="Password"/>
                </div><br/>
                <button type="submit">Submit</button>
            </form>  
            </div>
        </div>
    );
}

export default Signup;