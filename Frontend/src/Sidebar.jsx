import { useContext, useEffect } from 'react';
import './Sidebar.css';
import { MyContext } from './MyContext';

function Sidebar(){
    const {allThreads, setAllThreads, currThreadId} = useContext(MyContext);

    const getAllThreads = async () => {
        try{
            const response = await fetch("http://localhost:8080/api/thread")
            const res = await response.json();
            const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}))
            console.log(filteredData);
            setAllThreads(filteredData);
            // store threadId, title for thread display
        }catch(err){
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId])
    return(
       <section className='sidebar'>
        {/* new chat button */}
        <button>
            <img src="src/assets/blacklogo.png" alt="gtp-logo" className='logo'></img>
            <span><i className="fa-solid fa-pen-to-square"></i></span>
        </button>

        {/* history */}
        <ul className='history'>
            {/* //to display */}
            {
                allThreads?.map((thread, idx) => (
                    <li key={idx}>{thread.title}</li>
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