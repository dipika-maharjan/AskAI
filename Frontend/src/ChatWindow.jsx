import './ChatWindow.css';
import Chat from './Chat.jsx';
import { useContext, useState } from 'react';
import { MyContext } from './MyContext.jsx';
import { SyncLoader } from 'react-spinners';
import { useEffect } from 'react';

function ChatWindow(){
    const {prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats} = useContext(MyContext);
    const [loading, setLoading] = useState(false);

    const getReply = async() => {
        setLoading(true)
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try{
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
        }catch(err){
            console.log(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                }, {
                    role: "assistant",
                    content: reply
                }]
            ));
        }
        setPrompt("")
    }, [reply]);
    return(
        <div className="chatWindow">
            <div className="navbar">
                <span>AskAI <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv">
                    <span className='userIcon'><i className="fa-solid fa-user"></i></span>
                </div>
            </div>

            <Chat></Chat>

            <SyncLoader color='#fff' loading={loading}></SyncLoader>

            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder='Ask anything' 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                    >

                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-circle-arrow-up"></i></div>
                </div>
                <p className='info'>
                    AskAI can make mistakes. Check important info.
                </p>
            </div>
        </div>
        
    )
}

export default ChatWindow;