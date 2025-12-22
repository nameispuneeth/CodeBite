import { useLocation, useNavigate } from "react-router-dom";
import "../../index.css";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useContext, useRef, useState } from "react";
import Swal from "sweetalert2";

export default function OtpPage() {
  const { theme } = useContext(ThemeContext);
  const DarkMode = theme === "dark";
  const { state } = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const { purpose } = state;
  const [pwd1, setpwd1] = useState('');
  const [pwd2, setpwd2] = useState('');
  const [pwderror, setpwderror] = useState(false);
  const [showPwdChange, setShowPwdChange] = useState(false);


  const handleChange = (i, val) => {
    if (val === "" || (/^[0-9]$/.test(val))) {
      const newArr = [...value];
      newArr[i] = val;
      setValue(newArr);

      if (val !== "" && i < 5) {
        inputRefs.current[i + 1].focus();
      }
    }
  };
  let registerUser=async ()=>{
    const authtoken=sessionStorage.getItem("token");
    const result = await fetch("http://localhost:8000/api/registerUser", {
      method: "GET",
      headers: {
        'authorization': authtoken,
        'Content-Type': 'application/json'
      }
    })
    const data = await result.json();
    if (data.status === 'ok') {
      Swal.fire({
        title: "Sign Up Successful!",
        text: "You have successfully created your account.",
        icon: "success",
        confirmButtonText: "Continue",
        background: `${DarkMode ? '#1e1e1e' : 'white'}`,
        confirmButtonColor: `${DarkMode ? '#1d4ed8' : 'black'}`
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login")
        }
      });
    } else {
      alert(data.error);
    }

  }
  let VerifyOTP = async () => {
    let currOTP = value.join("");
    const authtoken=sessionStorage.getItem("authToken");
    if(!authtoken){
      Swal.fire({
        title:"Session Expired",
        icon:"error",
        background: `${DarkMode ? '#1e1e1e' : 'white'}`,
      });
      navigate("/login");
      return;
    }
    const response=await fetch("http://localhost:8000/api/verifyotp",{
      method:"POST",
      headers:{
        'authorization':authtoken,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        otp:currOTP
      })
    })
    const data=await response.json();
    console.log(data);
    if (data.status=="ok") {
      sessionStorage.setItem("token",data.token);
      if (purpose === "changepwd") {
        setShowPwdChange(true);
      } else {
        registerUser();
      }
    }
    else alert(data.error);
  };
  const ChangePWD = async () => {
    const token = sessionStorage.getItem("token");
    console.log(pwd1,pwd2,token);

    if (pwd1 === pwd2 && token) {
      const response = await fetch("http://localhost:8000/api/changePWD", {
        method: 'POST',
        headers: {
          'authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pwd1
        })
      })

      const res = await response.json();

      if (res.status === "ok") {
        navigate("/");
      } else {
        alert(res.error);
      }
    }
    else setpwderror(true);
  }
  const pwdChangeHTML = () => {
    return (
      <div className={`flex items-center justify-center ${DarkMode ? 'bg-gray-800' : 'bg-gray-200'} w-80 sm:w-2/3 lg:w-1/3 h-auto rounded p-6`}>
        <div className={`w-full max-w-md p-8 rounded-2xl ${DarkMode ? 'bg-gray-800' : 'bg-gray-200'}shadow-lg`}>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">
            Change Password
          </h2>

          <form className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter New Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                onChange={(e) => {
                  setpwd1(e.target.value)
                  setpwderror(false);
                }}
                value={pwd1}
                className={`w-full p-2 border-3 rounded ${DarkMode ? 'border-gray-700 bg-transparent text-gray-400' : 'border-vscode text-black'}`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Re-enter Password
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                onChange={(e) => {
                  setpwd2(e.target.value)
                  setpwderror(false);
                }}
                value={pwd2}
                className={`w-full p-2 border-3 mb-2 rounded ${DarkMode ? 'border-gray-700 bg-transparent text-gray-400' : 'border-vscode text-black'}`}
              />
            </div>
            {pwderror && <p className="text-red-600 ml-1">Passwords Dont Match </p>}
            <div>
              <button
                type="button"
                onClick={() => ChangePWD()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && value[i] === "" && i > 0) {
      inputRefs.current[i - 1].focus();
    }
  }

  return (

    <div
      className={`${DarkMode ? "bg-gray-900" : "bg-gray-100"
        } h-screen flex flex-col justify-center items-center`}
    >
      <p className="text-xl text-wrap sm:text-2xl m-5 text-white">Enter Verification Code For {purpose === "changepwd" ? "Changing Password" : "Register"}</p>
      <div className="flex gap-2 justify-center items-center">
        {Array.from({ length: 6 }, (_, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            type="text"
            maxLength="1"
            value={value[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            className={`h-16 w-12 sm:h-20 sm:w-16 text-2xl sm:text-3xl border-2 ${DarkMode
                ? 'bg-gray-600 text-white border-gray-900'
                : 'bg-gray-300 text-black border-gray-100'
              } rounded text-center`}
            hidden={showPwdChange}
          />
        ))}
      </div>
      <div>
        <input
          type="submit"
          value="Verify"
          className={`mt-10 p-3 w-72 sm:w-96  border-2 font-semibold mb-5 text-white 
    ${DarkMode
              ? 'border-blue-700 hover:bg-blue-500 bg-blue-700'
              : 'border-black hover:bg-gray-900 bg-black'
            }`}
          onClick={() => VerifyOTP()}
          hidden={showPwdChange}
        />
      </div>
      {showPwdChange && pwdChangeHTML()}
    </div>
  );
}
