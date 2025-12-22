import { useContext, useRef, useState, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import PlayGroundHeader from "./PlayGroundHeader";
import { Sun, Moon, Save, WandSparkles, PlusCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import "../App.css";
import Swal from 'sweetalert2';

const Languages = [
    {
        id: 92,
        name: "Python (3.11.2)",
        code: `print("Hello, World!")`,
        extension: "py",
        lang: "python"
    },
    {
        id: 91,
        name: "Java (JDK 17.0.6)",
        code: `public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}`,
        extension: "java",
        lang: "java"
    },
    {
        id: 105,
        name: "C++ (GCC 14.1.0)",
        code: `#include <iostream>\nint main() {\n\tstd::cout << "Hello, World!" << std::endl;\n\treturn 0;\n}`,
        extension: "cpp",
        lang: "cpp"
    },
    {
        id: 103,
        name: "C (GCC 14.1.0)",
        code: `#include <stdio.h>\nint main() {\n\tprintf("Hello, World!\\n");\n\treturn 0;\n}`,
        extension: "c",
        lang: "c"
    },
    {
        id: 97,
        name: "JavaScript (20.17.0)",
        code: `console.log("Hello, World!");`,
        extension: "js",
        lang: "javascript"
    },
    {
        id: 106,
        name: "Go (1.22.0)",
        code: `package main\nimport "fmt"\nfunc main() {\n\tfmt.Println("Hello, World!")\n}`,
        extension: "go",
        lang: "go"
    },
    {
        id: 83,
        name: "Swift (5.2.3)",
        code: `print("Hello, World!")`,
        extension: "swift",
        lang: "swift"

    }
];
const ApiKey = process.env.REACT_APP_API_KEY_GET;


export default function PlayGround() {

    const { theme, setTheme } = useContext(ThemeContext);
    const DarkMode = theme === 'dark';
    const [Ind, setInd] = useState(2);
    const [Code, setCode] = useState("");
    const [codename, setcodename] = useState("main");

    const [AiLoading, setAiLoading] = useState(false);
    const [SaveLoad, setSaveLoad] = useState(false);

    useEffect(() => {
        const SessionCode = sessionStorage.getItem("code");
        if (SessionCode) {
            try {
                let parsed = JSON.parse(SessionCode);
                setCode(parsed.code);
                setcodename(parsed.name);
                let tempInd = Languages.findIndex(lang => lang.extension === parsed.extension);
                if (tempInd !== -1) {
                    setInd(tempInd);
                }

            } catch (e) {
                setCode(Languages[2].code);
            }
        }
        else {
            setCode(Languages[2].code);
        }

    }, [])

    const [IsRunning, setIsRunning] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [input, setinput] = useState('');
    const [output, setoutput] = useState('');
    let token = useRef('');

    let editorOptions = {
        fontSize: 17,
        wordWrap: 'on',
        fontFamily: "'Courier New', 'Fira Code', 'JetBrains Mono', monospace"
    };

    let PostData = async () => {
        const url = 'https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=true';
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': ApiKey,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                submissions: [
                    {
                        language_id: Languages[Ind].id,
                        source_code: btoa(Code),
                        stdin: btoa(input)
                    }
                ]
            })
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            token.current = result[0].token;
            return { "error": false };
        } catch (error) {
            console.error(error);
            return { "error": true };
        }
    };

    let getData = async () => {
        const url = `https://judge0-ce.p.rapidapi.com/submissions/batch?tokens=${token.current}&base64_encoded=true&fields=*`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': ApiKey,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(error);
        }
    };

    function needsInput(code, lang) {
        const patterns = {
            python: [/input\(/],
            cpp: [/\bcin\b/, /scanf\(/],
            c: [/scanf\(/],
            java: [/Scanner\s*\w+\s*=/],
            javascript: [/prompt\(/],
            go: [/fmt\.Scanf\(/],
            swift: [/readLine\(/],
        };

        const checks = patterns[lang.toLowerCase()];
        if (!checks) return false;

        return checks.some((regex) => regex.test(code));

    }

    let runCode = async () => {
        setIsRunning(true);
        setoutput("");
        const currentLang = Languages[Ind];
        const codeNeedsInput = needsInput(Code, currentLang.lang);
        if (codeNeedsInput && input.trim() === "") {
            Swal.fire({
                title: "Error",
                text: "This code expects input, but no input was provided.",
                icon: 'error',
                background: `${DarkMode ? '#1e1e1e' : 'white'}`,
                confirmButtonColor: `${DarkMode ? '#1d4ed8' : 'black'}`
            });
            setIsRunning(false);
            return;
        } else {
            let postRes = await PostData();
            if (postRes.error) {
                setIsRunning(false);
                setoutput("Server Error");
                return;
            }
            setTimeout(() => setoutput("Request In Queue...."), 300);
            let status_code = 1;
            let result;
            while (status_code === 1 || status_code === 2) {
                result = await getData();
                const submission = result?.submissions?.[0];
                if (!submission) {
                    setoutput("Submission data not available");
                    setIsRunning(false);
                    return;
                }
                status_code = submission.status_id;
                if (status_code === 2) setoutput("Request Processing....");
            }
            if (result.submissions[0].stdout) setoutput(atob(result.submissions[0].stdout));
            else if (result.submissions[0].compile_output) setoutput(atob(result.submissions[0].compile_output));
        }
        setIsRunning(false);
    };
    let SaveCode = async () => {
        setSaveLoad(true);
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const stored = sessionStorage.getItem("code");
        if (!token) {
            const codeToken = {
                code: Code,
                extension: Languages[Ind].extension,
                name: 'main'
            }
            setSaveLoad(false);
            sessionStorage.setItem("code", JSON.stringify(codeToken));
            alert("Login To Save Code");
            return;
        }
        else if (stored && stored !== "undefined") {
            const data = JSON.parse(stored);

            const Response = await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/user/updateCode`, {
                method: "POST",
                headers: {
                    'authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: data.name,
                    code: btoa(Code),
                    extension: data.extension,
                    _id: data._id,
                })
            })

            const result = await Response.json();
            if (result.status === "ok") {
                setSaveLoad(false);
                Swal.fire({
                    title: `<span style="color:${DarkMode ? 'white' : 'black'}">Success</span>`,
                    icon: 'success',
                    text: 'File Saved Successfully',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: `${DarkMode ? '#1d4ed8' : 'black'}`,
                    background: `${DarkMode ? '#1e1e1e' : 'white'}`,
                    color: `${DarkMode ? 'white' : 'black'}`,
                    customClass: {
                        popup: 'swal-custom-popup',
                    }
                });

            } else {
                setSaveLoad(false);
                alert("Unable To Save Code");
            }
            return;
        }
        if (token) {
            setSaveLoad(false);
            const { value: newName, isConfirmed } = await Swal.fire({
                title: `<span style="color:${DarkMode ? 'white' : 'black'}">File Name</span>`,
                input: 'text',
                inputPlaceholder: 'Your file name here',
                inputAttributes: {
                    style: `
                    background:${DarkMode ? '#1e1e1e' : 'white'};
                    color:${DarkMode ? 'white' : 'black'};
                    border:1px solid ${DarkMode ? '#444' : '#ccc'};
                  `
                },
                showCancelButton: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: `${DarkMode ? '#1e1e1e' : 'white'}`,
                color: `${DarkMode ? 'white' : 'black'}`,
                confirmButtonColor: `${DarkMode ? '#1d4ed8' : 'black'}`,
                preConfirm: () => {
                    if (Swal.getInput().value.trim() === "") {
                        Swal.showValidationMessage("Code Name Cant Be Empty");
                        return false;
                    }
                }
            });

            if (isConfirmed && newName.trim() !== "") {
                setcodename(newName);
            }

            const nameToSave = isConfirmed && newName.trim() !== "" ? newName : codename;
            const Response = await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/user/pushCode`, {
                method: "POST",
                headers: {
                    'authorization': token,
                    'Content-Type': 'application/json'

                },
                body: JSON.stringify({
                    Code: btoa(Code),
                    Date: new Date(),
                    name: nameToSave,
                    extension: Languages[Ind].extension

                })
            })
            const data = await Response.json();
            if (data.status === "ok") {
                setSaveLoad(false);
                const codeToken = {
                    code: atob(data.code.code),
                    extension: Languages[Ind].extension,
                    name: data.code.name,
                    _id: data.code._id,
                    date: data.code.date
                }
                sessionStorage.setItem("code", JSON.stringify(codeToken));
                Swal.fire({
                    title: `<span style="color:${DarkMode ? 'white' : 'black'}">Success</span>`,
                    icon: 'success',
                    text: 'File Saved Successfully',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: `${DarkMode ? '#1d4ed8' : 'black'}`,
                    background: `${DarkMode ? '#1e1e1e' : 'white'}`,
                    color: `${DarkMode ? 'white' : 'black'}`,
                    customClass: {
                        popup: 'swal-custom-popup',
                    }
                });
            } else {
                setSaveLoad(false);
                Swal.fire({ text: "Unable To Save Code", title: "Error", icon: 'error', background: `${DarkMode ? '#1e1e1e' : 'white'}`, timer: 4000 });

            }
        } else {
            setSaveLoad(false);
            Swal.fire({ text: "Login To Save Code", title: "Error", icon: 'error', background: `${DarkMode ? '#1e1e1e' : 'white'}`, timer: 4000 });
        }
    }
    let Spinner = () => <div className="loader" style={{
        border: `3px solid ${DarkMode ? '#f3f3f3' : 'white'}`,
        borderTop: `3px solid ${DarkMode ? '#3498db' : 'gray'}`,
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        animation: 'spin 1s linear infinite'
    }}></div>;

    let getAiData = async (prompt) => {
        setAiLoading(true);
        const Response = await fetch(`${process.env.REACT_APP_API_KEY_BACKEND_URL}/api/user/AiData`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Prompt: prompt,
                Language: Languages[Ind].lang,
                Code: Code
            })
        });
        const data = await Response.json();
        if (data.status !== "error") {
            const cleaned = data.result
                .replace(/^```[a-zA-Z0-9]*\n/, '')
                .replace(/```$/, '')
                .trim();
            setCode(cleaned);
        }
        setAiLoading(false);
    };

    let AiAlert = () => {
        Swal.fire({
            title: `<span style="color:${DarkMode ? 'white' : 'black'}">Enter Prompt</span>`,
            html: `
            <textarea id="my-textarea" rows="2" class="swal2-textarea" 
                style="background:${DarkMode ? '#2d2d2d' : 'white'};
                       color:${DarkMode ? 'white' : 'black'};
                       border:1px solid ${DarkMode ? '#444' : '#ccc'};
                       resize:none;" 
                placeholder="Type here..."></textarea>
            
        `,
            focusConfirm: false,
            background: `${DarkMode ? '#1e1e1e' : 'white'}`,
            confirmButtonColor: `${DarkMode ? '#1d4ed8' : 'black'}`,
            preConfirm: () => {
                const textareaValue = document.getElementById("my-textarea").value;

                if (!textareaValue) {
                    Swal.showValidationMessage("Prompt is required");
                    return false;
                }

                return { textareaValue };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const promptValue = result.value.textareaValue;

                getAiData(promptValue);
            }
        });


    }
    const NewPage = async () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const codeToken = localStorage.getItem("code") || sessionStorage.getItem("code");
        if (token && codeToken && codeToken.code !== Code) {
            const result = await Swal.fire({
                title: `<span style="color:${DarkMode ? 'white' : 'black'}">Unsaved Changes</span>`,
                text: "You have unsaved changes. Would you like to save them before leaving?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Save",
                cancelButtonText: "Cancel",
                background: `${DarkMode ? '#1e1e1e' : 'white'}`,
                color: `${DarkMode ? 'white' : 'black'}`,
                confirmButtonColor: `${DarkMode ? '#2563eb' : 'black'}`,
                cancelButtonColor: `${DarkMode ? '#6b7280' : '#888'}`,
                reverseButtons: true,
                customClass: {
                    popup: 'swal-custom-popup'
                }
            });

            if (result.isConfirmed) {
                await SaveCode();
            }
        }
        sessionStorage.removeItem("code");
        setcodename("main");
        setCode(Languages[Ind].code)

    }
    return (
        <div className={`h-screen flex flex-col overflow-hidden ${DarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <PlayGroundHeader />

            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
                {/* Left Editor */}
                <div className={`w-full h-full md:w-[60%] flex flex-col border-r-0 md:border-r-4 overflow-hidden ${DarkMode ? 'bg-vscode md:border-white' : 'bg-white md:border-black'}`}>
                    <header className={`flex justify-end items-center p-2 border-2 border-t-0 border-r-0 ${DarkMode ? 'bg-gray-800 border-white' : 'bg-gray-200 border-black'}`}>
                        <div className={`absolute left-2 p-3 border-r-2 ${DarkMode ? 'text-white border-white' : 'text-gray-700 border-black'} hidden md:block`}>
                            {codename}.{Languages[Ind].extension}
                        </div>
                        <button className="mr-2 border-2 border-gray-500 p-1 hidden md:block" onClick={() => NewPage()}>
                            <PlusCircle color={DarkMode ? "#ffffff" : "#000000"} />
                        </button>
                        <button className="mr-2 border-2 border-gray-500 p-1" onClick={() => AiAlert()}>
                            <WandSparkles color={DarkMode ? "#ffffff" : "#000000"} />
                        </button>

                        <button className="mr-2 border-2 border-gray-500 p-1" onClick={() => SaveCode()} >
                            {SaveLoad ? Spinner() : <Save color={DarkMode ? "#ffffff" : "#000000"} />}
                        </button>

                        {/* Language Dropdown */}
                        <div className="relative text-sm sm:text-xs md:text-xs mr-2 h-9">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`w-38 lg:w-52 ${DarkMode ? 'text-white bg-gray-800 hover:bg-gray-700 border-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-black'} rounded px-2 py-1 text-left border`}
                            >
                                {Languages[Ind].name}
                                <svg className="w-2 h-7 inline ml-1" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                            </button>

                            {isOpen && (
                                <div className={`z-10 mt-1 absolute w-full rounded shadow border ${DarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-300'}`}>
                                    <ul className="p-1 space-y-1 max-h-60 overflow-y-auto scroll-hidden text-sm">
                                        {Languages.map((val, ind) => (
                                            <li key={val.id}>
                                                <label className={`flex items-center p-1.5 rounded hover:cursor-pointer ${DarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-black'}`}>
                                                    <input
                                                        type="radio"
                                                        name="language"
                                                        value={val.name}
                                                        checked={Ind === ind}
                                                        onChange={() => {
                                                            if (sessionStorage.getItem("code")) {
                                                                sessionStorage.removeItem("code");
                                                                setcodename("main");
                                                            }
                                                            setInd(ind);
                                                            setCode(Languages[ind].code);
                                                            setIsOpen(false);
                                                        }}
                                                        className={`w-3.5 h-3.5 ${DarkMode ? 'bg-gray-900 border-gray-600 text-blue-500' : 'bg-white border-gray-300'}`}
                                                    />
                                                    <span className="ml-2">{val.name}</span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Toggle Button */}
                        <button className="mr-2 border-2 border-gray-500 p-1" onClick={() => setTheme(DarkMode ? 'light' : 'dark')}>
                            {DarkMode ? <Sun color="#ffffff" /> : <Moon />}
                        </button>

                        <button className={`${DarkMode ? 'bg-blue-700 hover:bg-blue-500' : 'bg-black hover:bg-gray-600'} p-2 w-12 h-9 sm:w-16 text-white font-bold flex items-center justify-center  sm:mr-2`} onClick={runCode}>
                            {IsRunning ? <Spinner /> : 'Run'}
                        </button>
                    </header>

                    {/* Editor */}
                    <div className="w-full relative flex flex-1 bg-vscode justify-center items-center">
                        <Editor
                            key={Ind}
                            height="100%"
                            width="100%"
                            language={Languages[Ind].lang}
                            options={editorOptions}
                            value={Code}
                            onChange={(val) => setCode(val)}
                            theme={DarkMode ? 'vs-dark' : 'vs-light'}
                        />
                        {AiLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                <Spinner />
                            </div>
                        )}

                    </div>
                </div>

                <div className={`w-full sm:w-[40%] h-full flex flex-col ${DarkMode ? 'bg-vscode' : 'bg-white'}`}>
                    {/* Input Box */}
                    <div className={`h-32 sm:h-[35%] ${DarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        <div className={`flex justify-between ${DarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 items-center'} items-center`}>
                            <p className="text-base p-2 font-normal">Input</p>
                            <button className={`text-sm w-15 h-7 p-3 font-light cursor-pointer border-2 flex items-center justify-center mr-2 text-center  ${DarkMode ? 'text-white  border-gray-400' : 'text-black  border-gray-600'}`} onClick={() => setinput("")}>
                                Clear
                            </button>
                        </div>
                        <textarea
                            cols={120}
                            className={`w-full flex-1 resize-none h-[100%] scroll-hidden border-2 focus:border-0 ${DarkMode ? 'bg-vscode text-white border-black' : 'bg-white text-black border-gray-300'}`}
                            value={input}
                            onChange={(e) => setinput(e.target.value)}
                        />
                    </div>

                    {/* Output Box */}
                    <div className={`h-64 sm:h-[65%] ${DarkMode ? 'bg-vscode' : 'bg-white'}`}>
                        <div className={`flex justify-between ${DarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} flex-1 items-center`}>
                            <p className="text-base p-2 font-normal">Output</p>
                            <button className={`text-sm w-15 h-7 p-3 font-light cursor-pointer border-2 flex items-center justify-center mr-2 text-center  ${DarkMode ? 'text-white  border-gray-400' : 'text-black  border-gray-600'}`} onClick={() => setoutput("")}>
                                Clear
                            </button>
                        </div>
                        <textarea
                            cols={120}
                            className={`w-full flex-1 resize-none h-[100%] font-tt font-medium scroll-hidden border-2 focus:border-0 ${DarkMode ? 'bg-vscode text-white border-black' : 'bg-white text-black border-gray-300'}`}
                            value={output}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
