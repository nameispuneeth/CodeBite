import { useNavigate } from "react-router-dom";
import { SiCplusplus, SiJavascript, SiPython, SiC, SiGo, SiSwift } from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useContext,useState } from "react";
import { Pencil,Trash2,ArrowDownToLine } from "lucide-react";
import Swal from "sweetalert2";

export default function Card({data,handleDelete}) {
    const navigate=useNavigate();
    const date=new Date(data.date).toLocaleDateString();
    const language=data.extension
    const {theme}=useContext(ThemeContext);
    const [CurrTitle,setCurrTitle]=useState(data.name);
    const [changeName,setchangeName]=useState(false);
    const [title,settitle]=useState(data.name);
    const DarkMode=theme==='dark';

    let setStorage=()=>{
        
        const encodedData = {
        _id:data._id,
        extension:data.extension,
        name:CurrTitle,
        date:data.date,
        code: atob(data.code),
        
        };

        sessionStorage.setItem("code",JSON.stringify(encodedData));
        navigate("/")
    }
    let EditTitle=()=>{
        setchangeName(true);
    }
    let ChangeName=async ()=>{
        if(localStorage.getItem("code")!=null)  sessionStorage.removeItem("code");
        let token=localStorage.getItem('token') || sessionStorage.getItem('token');
        if(token){
            setchangeName(false);
            
            let Response=await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/user/updateTitle`,{
                method:"POST",
                headers:{
                    "authorization":token,
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    _id:data._id,
                    title:title
                })
            })

            let gotData=await Response.json();

            if(gotData.status==="ok"){
                Swal.fire({
                    title:'Success',
                    icon:'success',
                    text:'SuccessFull Updation Of FileName',
                    timer:4000,
            background: `${DarkMode ? '#1e1e1e' : 'white'}`,
                })
                setCurrTitle(title);
            }else{
                alert(gotData.error);
            }

    }

    }

    let DeleteHelper=async ()=>{
        sessionStorage.removeItem("code");
        const token=localStorage.getItem("token")||sessionStorage.getItem("token");
        if(token){
            let Response=await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/user/deleteData`,{
                method:"POST",
                headers:{
                    'authorization':token,
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                   _id:data._id  
                })
            })
            let res=await Response.json();
            if(res.status==="ok"){
                handleDelete(data._id);
            }else{
                Swal.fire({
                    title:"Error",
                    icon:"error",
                    text:"Unable To Delete",
                    timer:3000
                })
            }
        }
            
    }
    let DeleteData=async ()=>{
        Swal.fire({
    title: "Are You Sure?",
    icon: "warning",
    text: "This File Will Be Deleted Permanently",
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    confirmButtonColor: DarkMode ? "#1d4ed8" : "black",
    cancelButtonColor: DarkMode ? "#6b7280" : "gray",
    background: DarkMode ? "#030712" : "white",
}).then(async (result) => {
    if (result.isConfirmed) {
        Swal.fire({
            title: "Re-enter Your CodeName To Delete",
            input: "text",
            inputPlaceholder: "Enter Your Code Name",
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: DarkMode ? "#dc2626" : "red",
            cancelButtonColor: DarkMode ? "#6b7280" : "gray",
            background: DarkMode ? "#030712" : "white",
            customClass: {
        input: DarkMode ? "swal2-input-dark" : "" 
    },
            preConfirm: () => {
                if (Swal.getInput().value !== CurrTitle) {
                    Swal.showValidationMessage("Different Code Name");
                    return false;
                }
            }
        }).then(async (result) => {
            if (result.value === CurrTitle) {
                await DeleteHelper();
            }
        });
    }
});

        
        
    }
    let inputFunc=()=>{
        return(
            <>
                <input type="text" className="border-0 border-b-2 bg-white dark:bg-gray-800 w-20 h-8 border-white" value={title} onChange={(e)=>settitle(e.target.value)}></input>
            </>
        )
    }

    let DownloadCode=()=>{
        const blob = new Blob([atob(data.code)], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${CurrTitle}.${data.extension}`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
   let FindLangLogo=()=>{
    if(data.extension==='cpp') return <SiCplusplus/>
    else if(data.extension==='py') return <SiPython/>
    else if(data.extension==='java') return <FaJava/>
    else if(data.extension==='c') return <SiC/>
    else if(data.extension==='js') return <SiJavascript/>
    else if(data.extension==='go') return <SiGo/>
    return <SiSwift/>
   }
    return (
        <div className="max-w-sm p-4 m-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 text-nowrap">
            <div className="flex justify-between mb-1">
                {FindLangLogo()}
            <div className="flex gap-4">
            <ArrowDownToLine color={DarkMode?'white':'black'} size={"18px"} className="cursor-pointer" onClick={()=>DownloadCode()}> </ArrowDownToLine>
            <Trash2 color={DarkMode?'white':'black'} size={"18px"} className="cursor-pointer" onClick={()=>DeleteData()}> </Trash2>
            </div>
            </div>
            <div className="flex align-middle gap-5">
                <h5 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {!changeName && CurrTitle}
                    {changeName && inputFunc()}
                    <span>
                    .{language}
                    </span>
                </h5>
                {!changeName && <Pencil size={"19px"} className="cursor-pointer mt-1" onClick={()=>EditTitle()}/> }
                {changeName && <button className={`text-xs p-1 mb-2 border-2 w-10 text-white focus:ring-4 focus:outline-none ${DarkMode?'bg-blue-700 rounded-lg hover:bg-blue-800  focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800':'bg-black hover:bg-gray-800'} `} onClick={()=>ChangeName()}> Set</button> }
            </div>
            <p className="mb-3 font-normal text-gray-500 dark:text-gray-400 text-base">Last Modified On : {date}</p>
            <button className={`inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white focus:ring-4 focus:outline-none ${DarkMode?'bg-blue-700 rounded-lg hover:bg-blue-800  focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800':'bg-black hover:bg-gray-800'} `} onClick={()=>setStorage()}>
                Edit Code
                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                </svg>
            </button>
        </div>

    )
}