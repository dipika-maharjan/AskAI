import './ChatWindow.css';
import Chat from './Chat.jsx';
import { useContext, useState } from 'react';
import { MyContext } from './MyContext.jsx';
import { SyncLoader } from 'react-spinners';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

function ChatWindow(){
    const { token, user, logout, login, prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false); //set default false value
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const [showProfileSavedPopup, setShowProfileSavedPopup] = useState(false);
    const [profileName, setProfileName] = useState(user?.name ?? '');
    const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState('');

    useEffect(() => {
        setProfileName(user?.name ?? '');
        setProfileEmail(user?.email ?? '');
    }, [user]);

    // Open a custom logout popup instead of the browser confirm dialog
    const handleLogoutClick = () => {
        setIsOpen(false);
        setShowLogoutPopup(true);
    };

    // Open the profile editing popup
    const handleSettingsClick = () => {
        setIsOpen(false);
        setProfileError('');
        setShowSettingsPopup(true);
    };

    // Save updated profile fields to the backend and update shared auth state
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileError('');

        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:8080/auth/profile', {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    name: profileName,
                    email: profileEmail
                })
            });

            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json')
                ? await response.json()
                : { message: await response.text() };

            if (!response.ok) {
                const firstError = Array.isArray(data.errors) && data.errors.length > 0 ? data.errors[0].msg : '';
                setProfileError(data.message || firstError || 'Failed to save profile');
                setProfileSaving(false);
                return;
            }

            login({ token, user: data.user });
            setShowSettingsPopup(false);
            setShowProfileSavedPopup(true);
        } catch (err) {
            console.log(err);
            setProfileError('Network error');
        }

        setProfileSaving(false);
    };

    const getReply = async() => {
        if (!prompt || !prompt.trim()) {
            return;
        }

        const activeThreadId = currThreadId || uuidv4();
        if (!currThreadId) {
            setCurrThreadId(activeThreadId);
        }

        setLoading(true);
        setNewChat(false);
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const options = {
            method: 'POST',
            headers,
            body: JSON.stringify({
                message: prompt,
                threadId: activeThreadId
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

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    return(
        <div className="chatWindow">
            <div className="navbar">
                <span>AskAI <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className='userIcon'><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            {
                isOpen && 
                <div className="dropDown">
                    <button type="button" className="dropDownItem dropDownButton dropDownButtonCompact" onClick={handleSettingsClick}>
                        <i className="fa-solid fa-user-pen"></i>Edit profile
                    </button>
                    <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i>Upgrade Plan</div>
                    <button type="button" className="dropDownItem dropDownButton dropDownButtonCompact" onClick={handleLogoutClick}>
                        <i className="fa-solid fa-right-from-bracket"></i>Logout
                    </button>
                    
                </div>
            }

            {showLogoutPopup && (
                <div className="modalOverlay" onClick={() => setShowLogoutPopup(false)}>
                    <div className="modalCard" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Logout?</h3>
                        <p className="modalText">Are you sure you want to logout?</p>
                        <div className="modalActions">
                            <button type="button" className="modalSecondary" onClick={() => setShowLogoutPopup(false)}>Cancel</button>
                            <button type="button" className="modalPrimary" onClick={() => { setShowLogoutPopup(false); logout(); }}>Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {showProfileSavedPopup && (
                <div className="modalOverlay" onClick={() => setShowProfileSavedPopup(false)}>
                    <div className="modalCard" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Changes saved</h3>
                        <p className="modalText">Your profile was updated successfully.</p>
                        <div className="modalActions">
                            <button type="button" className="modalPrimary" onClick={() => setShowProfileSavedPopup(false)}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {showSettingsPopup && (
                <div className="modalOverlay" onClick={() => setShowSettingsPopup(false)}>
                    <div className="modalCard modalCardWide" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">Edit profile</h3>
                        <p className="modalText">Update your name and email below.</p>
                        {profileError ? <div className="profileError">{profileError}</div> : null}
                        <form className="profileForm" onSubmit={handleSaveProfile}>
                            <label className="profileField">
                                <span>Name</span>
                                <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your name" />
                            </label>
                            <label className="profileField">
                                <span>Email</span>
                                <input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} placeholder="you@example.com" />
                            </label>
                            <div className="modalActions">
                                <button type="button" className="modalSecondary" onClick={() => setShowSettingsPopup(false)}>Cancel</button>
                                <button type="submit" className="modalPrimary" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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