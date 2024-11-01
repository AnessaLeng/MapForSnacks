import { GoogleLogin } from 'react-google-login';
import { useAuth } from '../content/Authentication';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID; //'988046540404-rvnhbcvmi6ksqda0vgnj5gv0g8goebs2.apps.googleusercontent.com'

function Login() {
    const { login, setError } = useAuth();

    const onSuccess = (res) => {
        console.log("Login Success! Current user: ", res.profileObj);
        const idToken = res.tokenId; // Get the ID token
        login(res.profileObj, idToken); // This could also set user details in your context
    }

    const onFailure = (res) => {
        console.log("Login Failed! res: ", res);
        setError(res);
    }

    return (
        <div id='signInButton'>
            <GoogleLogin 
                clientId={clientId}
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedOn={true}
            />
        </div>
    )
}

export default Login;