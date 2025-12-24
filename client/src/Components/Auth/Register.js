import { useContext, useState, useRef } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { CircleAlert } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import {useGoogleLogin} from '@react-oauth/google'


export default function Register() {
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const DarkMode = theme === 'dark';
    const [email, setemail] = useState('');
    const [pwd, setpwd] = useState('');
    const [Invalid, setInvalid] = useState(false);
    const Error = useRef('');
    const [name, setname] = useState('');
    const [loading, setLoading] = useState(false);

    const responseFromGoogle=async(authRes)=>{
        try{
          setLoading(true);
          if(authRes.code){
            const encodedCode = encodeURIComponent(authRes.code);
            const response=await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/auth/google/${encodedCode}`,{
              method:"GET"
            });
            const data=await response.json();
            if(data.status==="ok"){
              localStorage.setItem("token",data.token);
              navigate("/");
            }else{
                alert(data.error);
            }
          }
        }catch(e){
          alert("Unable To Access");
        }
        setLoading(false);
      }
      const googleLogin=useGoogleLogin({
        onSuccess:responseFromGoogle,
        onError:responseFromGoogle,
        flow:'auth-code',
      })


    let HandleSubmission = async () => {
        setInvalid(false);
        setLoading(true);
        let Response = await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name, email, pwd
            })
        })

        let data = await Response.json();

        if (data.status === 'ok') {
            setLoading(false);
            sessionStorage.setItem("authToken",data.authToken);
            navigate('/verify-otp', { state: { purpose: "register" } });

        } else {
            setInvalid(true);
            setLoading(false);
            Error.current = data.error;
        }
    }
    let ErrorMsg = () => {
        return (
            <div className="border-2 border-red-900 w-full gap-3 p-2 rounded bg-red-900 flex mb-5 ">
                <CircleAlert color='#ffffff' />
                <p className="text-white font-sans font-extralight"> {Error.current}</p>
            </div>
        )
    }
    return (
        <div className="h-screen bg-black">
            <div className="flex justify-center items-center h-full">
                <div className={`${DarkMode ? 'bg-vscode' : 'bg-white'} p-6 rounded shadow-md w-full max-w-md`}>
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <p className={`flex justify-center mb-10 font-extrabold text-5xl ${DarkMode ? 'text-blue-700' : 'text-black'} `}>Register</p>
                    <div>
                        <input
                            type="text"
                            placeholder="Enter Your Name"
                            value={name}
                            onChange={(e) => {
                                setname(e.target.value);
                                setInvalid(false);
                            }}
                            className={`w-full mb-7 p-2 border-3 rounded ${DarkMode ? 'border-gray-700 bg-transparent text-gray-400' : 'border-vscode text-black'}`}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Enter Your Email"
                            value={email}
                            onChange={(e) => {
                                setemail(e.target.value);
                                setInvalid(false);
                            }}
                            className={`w-full mb-7 p-2 border-3 rounded ${DarkMode ? 'border-gray-700 bg-transparent text-gray-400' : 'border-vscode text-black'}`}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Enter Your Password"
                            value={pwd}
                            onChange={(e) => {
                                setpwd(e.target.value);
                                setInvalid(false);
                            }}
                            className={`w-full p-2 border-3 mb-9 rounded ${DarkMode ? 'border-gray-700 bg-transparent text-gray-400' : 'border-vscode text-black'}`}
                            required
                        />
                        <button className={`w-full p-2 border-2 font-semibold mb-5 text-white ${DarkMode ? 'border-blue-700 hover:bg-blue-500 bg-blue-700 ' : 'border-black hover:bg-gray-900 bg-black'}`} onClick={()=>HandleSubmission()}> Register </button>
                        <button className={`w-full p-2 border-2 font-semibold mb-5 text-white ${DarkMode ? 'border-blue-700 hover:bg-blue-500 bg-blue-700 ' : 'border-black hover:bg-gray-900 bg-black'}`} onClick={()=>googleLogin()}>Continue with Google</button>

                        {Invalid && ErrorMsg()}
                        <p className={`flex justify-center font-light text-sm ${DarkMode ? 'text-white' : 'text-black'}`}>Already Have An Account ?    <span className={`ml-1 cursor-pointer font-semibold ${DarkMode ? 'text-blue-500' : 'text-gray-800'}`} onClick={() => navigate("/login")}>Login</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
