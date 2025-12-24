import { Routes, Route } from 'react-router-dom';
import "./input.css"
import PlayGround from './Components/Main';
import Register from './Components/Auth/Register';
import Login from './Components/Auth/Login';
import UserHome from './Components/UserHomePage/UserHome';
import OTPVerif from './Components/Auth/OTPVerif';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_API_KEY_GOOGLE_CLIENT_ID}>    
      <Routes>
      <Route path="/" element={<PlayGround/>}></Route>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/register" element={<Register/>}></Route>
      <Route path="/userhome" element={<UserHome/>}></Route>
      <Route path="/verify-otp" element={<OTPVerif/>}></Route>
    </Routes>
    </GoogleOAuthProvider>

    </>
  );
}

export default App;
