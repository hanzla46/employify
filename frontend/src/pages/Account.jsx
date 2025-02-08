
import React,{useState, useEffect} from 'react'
import { Link } from 'react-router-dom';

export function Account() {
  const [loggedUser, setLoggedUser] = useState();
  useEffect(() => {
    setLoggedUser(localStorage.getItem("loggedIn"));
  }, [])
  return (
    <div className='flex justify-center items-center pt-20 pb-20'> <h1 className="text-4xl md:text-6xl font-bold mb-6 pt-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
    {loggedUser ? "Manage Account" :<Link to={"/signup"}>Signup Here</Link>}
  </h1></div>
  )
}
