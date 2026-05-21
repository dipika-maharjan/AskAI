import { useContext, useEffect } from 'react';
import './Sidebar.css';
import { MyContext } from './MyContext.jsx';
import {v1 as uuidv1} from "uuid";

function Sidebar(){
    const { token, logout, allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);

    const getAllThreads = async () => {
        try{
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers.Authorization = `Bearer ${token}`;

            const response = await fetch("http://localhost:8080/api/thread", { headers })
            const res = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout(true);
                    return;
                }
                console.log(res);
                setAllThreads([]);
                return;
            }

            const threadArray = Array.isArray(res) ? res : [];
            const filteredData = threadArray.map(thread => ({threadId: thread.threadId, title: thread.title}))
            setAllThreads(filteredData);
        }catch(err){
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, token])

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try{
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers.Authorization = `Bearer ${token}`;

            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`, { headers });
            const res = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout(true);
                    return;
                }
                console.log(res);
                return;
            }

            setPrevChats(Array.isArray(res) ? res : []);
            setNewChat(false);
            setReply(null);
        }catch(err){
            console.log(err);
        }
    }

    const deleteThread = async (threadId) => {
        try{
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers.Authorization = `Bearer ${token}`;

            const response = await fetch(`http://localhost:8080/api/thread/${threadId}`, {method: "DELETE", headers});
            const res = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout(true);
                    return;
                }
                console.log(res);
                return;
            }

            //updated threads re-render
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if(threadId === currThreadId){
                createNewChat();
            }
        }catch(err){
            console.log(err);
        }
    }

    return(
       <section className='sidebar'>
        {/* new chat button */}
        <button onClick={createNewChat}>
            <img src="src/assets/blacklogo.png" alt="gtp-logo" className='logo'></img>
            <span><i className="fa-solid fa-pen-to-square"></i></span>
        </button>

        {/* history */}
        <ul className='history'>
            {/* //to display */}
            {
                allThreads?.map((thread, idx) => (
                    <li key={idx}
                        onClick={(e) => changeThread(thread.threadId)}
                        className={thread.threadId === currThreadId ? "highlighted" : " "}
                    >
                        {thread.title}
                        <i className="fa-solid fa-trash"
                            onClick={(e) => {
                                    e.stopPropagation(); //stop event bubbling
                                    deleteThread(thread.threadId);
                            }}
                        >
                        </i>
                    </li>
                ))
            }
        </ul>

        {/* sign */}
        <div className="sign">
            <p>By Dipika &hearts;</p>
        </div>
       </section>
    )
}

export default Sidebar;