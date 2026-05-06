import './ChatWindow.css';
import Chat from './Chat.jsx';

function ChatWindow(){
    return(
        <div className="chatWindow">
            <div className="navbar">
                <span>AskAI <i class="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv">
                    <span className='userIcon'><i class="fa-solid fa-user"></i></span>
                </div>
            </div>

            <Chat></Chat>

            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder='Ask anything'></input>
                    <div id="submit"><i class="fa-solid fa-circle-arrow-up"></i></div>
                </div>
                <p className='info'>
                    AskAI can make mistakes. Check important info.
                </p>
            </div>
        </div>
        
    )
}

export default ChatWindow;