import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { CircleAlert } from 'lucide-react';
import Cookies from 'js-cookie'


export default function Login() {
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const DarkMode = theme === 'dark';
    const errorMsg = useRef('');
    const [email, setemail] = useState('');
    const [pwd, setpwd] = useState('');
    const [Invalid, setInvalid] = useState(false);
    const [checked, setChecked] = useState(false);

    let HandleSubmission = async (e) => {
        e.preventDefault();
        setLoading(true);
        let Response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email, pwd
            })
        })

        let data = await Response.json();

        if (data.status === 'ok') {
            setLoading(false);
            if (checked) localStorage.setItem('token', data.token);
            else sessionStorage.setItem('token', data.token);
            navigate("/userhome")
        } else {
            setInvalid(true);
            setLoading(false);
            errorMsg.current = data.error;
        }
    }
    let ErrorMsg = () => {
        return (
            <div className="border-2 border-red-900 w-full gap-3 p-2 rounded bg-red-900 flex mb-5 ">
                <CircleAlert color='#ffffff' />
                <p className="text-white font-sans font-extralight">{errorMsg.current}</p>
            </div>
        )
    }

    let ForgotPWD = async () => {
        const emailInput = document.querySelector('input[type="email"]');
        setLoading(true);
        if (!emailInput.checkValidity()) {
            emailInput.reportValidity();
            setLoading(false);
            return;
        }
        const req = await fetch("http://localhost:8000/api/sendmailforpwdchange", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email
            })
        })

        const res = await req.json();

        if (res.status === "ok") {
            setLoading(false);
            sessionStorage.setItem("authToken",res.authToken);
            navigate("/verify-otp", { state: { purpose: "changepwd" } });
        }
        else {
            setLoading(false);
            alert(res.error)
        };
    }
    return (
        <div className="h-screen bg-black">
            <div className="flex justify-center items-center h-full w-full">
                <div className={`${DarkMode ? 'bg-vscode' : 'bg-gray-100'} p-6 rounded shadow-md relative`}>
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}


                    <p className={`flex justify-center mb-10 font-extrabold text-5xl ${DarkMode ? 'text-blue-700' : 'text-black'}`}>LOGIN</p>
                    <form onSubmit={HandleSubmission}>
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
                        <div className="flex items-center mb-4 justify-between">
                            <div className="flex justify-center items-center">
                                <input id="checked-checkbox" type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="w-4 h-4 cursor-pointer text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <p className={`ms-2 text-sm font-medium ${DarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Remember Me</p>
                            </div>
                            <div>
                                <p className={`ms-2 text-sm cursor-pointer font-bold ${DarkMode ? 'text-blue-600' : 'text-gray-900'}`} onClick={() => ForgotPWD()}> Forgot Password</p>

                            </div>
                        </div>

                        <input type="submit" value="Login" className={`w-full p-2 border-2 cursor-pointer font-semibold mb-5 text-white ${DarkMode ? 'border-blue-700 hover:bg-blue-500 bg-blue-700 ' : 'border-black hover:bg-gray-700 bg-black'}`}></input>

                        {Invalid && ErrorMsg()}

                        <p className={`flex justify-center font-light text-sm ${DarkMode ? 'text-white' : 'text-black'}`}>Don't Have An Account ?  <span className={`ml-1 cursor-pointer font-semibold ${DarkMode ? 'text-blue-500' : 'text-gray-800'}`} onClick={() => navigate("/register")}> Register </span> </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
