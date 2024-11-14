import { GoogleLogout } from 'react-google-login';
import { useAuth } from './Authentication';
import { useNavigate } from 'react-router-dom';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID; //'988046540404-rvnhbcvmi6ksqda0vgnj5gv0g8goebs2.apps.googleusercontent.com'

function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const onSuccess = () => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        console.log("Log out Successful!");
        logout();
        navigate('/login');
    }

    return (
        <div id='signOutButton'>
            <GoogleLogout 
                clientId={clientId}
                buttonText="Logout"
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}

export default Logout;