import UserHomeHeader from "./UserHomeHeader";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useContext, useEffect, useState,useRef } from "react";
import Swal from "sweetalert2";
import Card from "./Card";

export default function UserHome() {
    const { theme } = useContext(ThemeContext);
    const [userName, setUserName] = useState("");
    const [userCodes, setUserCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const userExists=useRef(false);

useEffect(() => {
    const getUserCodes = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/user/getUserData`, {
            method: "POST",
            headers: {
              "authorization": token,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (data.status === "ok") {
            userExists.current = true;
            setLoading(false);
            setUserCodes(data.codes);
            setUserName(data.userName);
          } else {
            Swal.fire({
              title: "Error",
              icon: "error",
              text: "Unable to fetch user data.",
              confirmButtonColor: `${DarkMode ? "#1d4ed8" : "black"}`,
              background: `${DarkMode ? "#1e1e1e" : "white"}`,
            });
          }
        } catch (error) {
          setLoading(false);
          console.error("Error fetching codes:", error);
        }
      } else {
        setLoading(false);
        alert("Login to view your codes.");
      }
    };
    getUserCodes();
  }, []);

  
    const handleDelete = (id) => {
        setUserCodes((prevCodes) => prevCodes.filter(code => code._id !== id));
    };
    const DarkMode = theme === 'dark';

   


    let ShowUserData = () => {
        return (
            <>


                {userCodes.map((data) => (
                    <Card
                        key={data._id}
                        data={data}
                        handleDelete={handleDelete}

                    />
                ))}
            </>
        );
    }
        let NoData = () =>{
            return(
                <div className="p-10">
<p>
    {loading ? " Loading ..." : "No Saved Files To Display"}
    </p>
        </div>
            );
        }

    let Helper1=()=>{
        return(
            <>
            {loading ?" ":"No User Credentials"}
            </>
        )
    }
    let changeName=async () => {
        const { value: newName } = await Swal.fire({
            title: "Change Your Name",
            input: "text",
            inputLabel: "Enter your new name",
            inputPlaceholder: "New name...",
            showCancelButton: true,
            confirmButtonColor: DarkMode ? "#1d4ed8" : "black",
            background: DarkMode ? "#1e1e1e" : "white",
          });
          if(newName && newName.trim()!==""){
            const token=localStorage.getItem("token") || sessionStorage.getItem("token");
            const response=await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/user/changeUserName`,{
                method:"POST",
                headers:{
                    'authorization':token,
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({newname:newName})
            })
            const data=await response.json();
            if(data.status==="ok"){
                localStorage.getItem("token")?localStorage.setItem("token",data.token):sessionStorage.setItem("token",data.token)
                setUserName(newName);

                Swal.fire({
                    title:"Success",
                    icon:'success',
                    text:"Name Changed SuccessFully",
                    timer:3000,
                    showCancelButton: true,
                    background: `${DarkMode ? '#1e1e1e' : 'white'}`,
      confirmButtonColor: `${DarkMode ? '#1d4ed8' : 'black'}`
                })
            }
        }
    }
    let ChangeUserNameBtn= ()=>{
        return(
         <p
  className={`text-white font-bold 
    text-xs px-2 py-1     
    sm:text-sm sm:px-3 sm:py-1.5 sm:mr-2   
    md:text-base md:px-4 md:py-2   
    rounded-lg shadow-md transition 
    flex justify-center items-center
    ${DarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-700'} 
    cursor-pointer`}
  onClick={() => changeName()}
>
  Change Name
</p>

        );
    }
    return (
        <div className={`min-h-screen w-full ${DarkMode ? 'bg-gray-800 text-white' : 'bg-gray-300 text-black'} relative`}>
            {loading &&
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            }
            <UserHomeHeader />
            <div className="font-tt p-1">

                <div className="ml-2 sm:text-4xl font-bold text-2xl mt-4 flex justify-between">
                    <div>
                    {!userExists.current
                        ? Helper1()                        : `Welcome Back, ${userName}`}
                        </div>
                        <div>
                        {userExists.current  && ChangeUserNameBtn()}
                        </div>
                </div>

                <div className={`mt-12 sm:text-2xl text-xl mb-12`}>
                    <p className="ml-2">Your Saved Files:</p>
                    <div className="flex justify-center items-center">
                        <div className={`mt-5 w-[95%] border-2 rounded flex flex-wrap gap-4 overflow-x-auto justify-center items-center ${DarkMode ? 'bg-gray-700' : 'bg-gray-400'}`}>
                            {Object.keys(userCodes).length === 0 ? NoData() : ShowUserData()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
