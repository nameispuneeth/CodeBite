import { useContext } from "react"
import { ThemeContext } from "../contexts/ThemeContext"
import { useNavigate } from "react-router-dom";
import { Cookie } from "lucide-react";
import { User } from "lucide-react";
import Swal from "sweetalert2";
export default function PlayGroundHeader() {
  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const DarkMode = theme === 'dark';
  const isLogged = () => {
    return localStorage.getItem("token") != null || sessionStorage.getItem("token") != null;
  }
  const LogoutUser = async () => {
    if (localStorage.getItem("token") != null) localStorage.removeItem("token");
    else sessionStorage.removeItem("token");
    
    if(sessionStorage.getItem("code")) sessionStorage.removeItem("code");

    Swal.fire({
      title: 'Logout Successfull',
      icon: 'success',
      text: 'You Have Been Logged Out Succesfully',
      confirmButtonText: "Continue",
      background: `${DarkMode ? '#1e1e1e' : 'white'}`,
      confirmButtonColor: `${DarkMode ? '#1d4ed8' : 'black'}`
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login")
      }
    });

  }
  const showLogin = () => {
    return (
      <p
        className={`text-white font-bold text-sm px-4 py-2 ${DarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-700'} cursor-pointer`}
        onClick={() => navigate("/login")}
      >
        Login
      </p>
    );
  }

  const showLogout = () => {
    return (
      <div className="flex gap-3">
        <div className={`border-2 rounded-full w-9 h-9 flex items-center justify-center ${DarkMode ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 hover:bg-gray-300'} cursor-pointer`}>
          <User color={`${DarkMode ? 'white' : 'black'}`} size={23} onClick={() => navigate('/userhome')} />
        </div>
        <p
          className={`text-white font-bold text-sm px-4 py-2 ${DarkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-black hover:bg-gray-700'} cursor-pointer`}
          onClick={() => LogoutUser()}
        >
          Logout
        </p>
      </div>
    )
  }
  return (
    <header className={` border-b-2 h-16 ${DarkMode ? 'bg-gray-900 text-white border-white' : 'bg-gray-300 text-black border-black'} font-bold`}>
      <nav className="flex items-center justify-between p-4" aria-label="Global">

        {/* Logo */}
        <div className="pl-2 flex items-center">
          <div className="-m-1.5 p-1.5 flex items-center gap-2">
            {/* <img
              className="h-6 w-6"
              src="https://flowbite.com/docs/images/logo.svg"
              alt="Flowbite Logo"
            /> */}
            <p className="font-tt text-3xl font-bold cursor-pointer flex flex-1 gap-2 justify-center align-middle">
              CodeBite
              <Cookie className="w-8 h-8" />
            </p>
          </div>
        </div>


        {/* Desktop Navigation Links */}
        {/* <PopoverGroup className="lg:flex lg:gap-x-8">
          <a href="#" className="text-sm font-semibold text-white hover:text-blue-500">Home</a>
          <a href="#" className="text-sm font-semibold text-gray-400 hover:text-blue-500">Company</a>
          <a href="#" className="text-sm font-semibold text-gray-400 hover:text-blue-500">Marketplace</a>
          <a href="#" className="text-sm font-semibold text-gray-400 hover:text-blue-500">Features</a>
          <a href="#" className="text-sm font-semibold text-gray-400 hover:text-blue-500">Team</a>
          <a href="#" className="text-sm font-semibold text-gray-400 hover:text-blue-500">Contact</a>
        </PopoverGroup> */}

        {/* Buttons */}
        <div className={`flex items-center pl-4 gap-2 pr-0`}>
          {isLogged() ? showLogout() : showLogin()}

        </div>
      </nav>
    </header>
  )
}
