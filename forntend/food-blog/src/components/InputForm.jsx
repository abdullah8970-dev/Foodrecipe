import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function InputForm({ setIsOpen, onLoginSuccess }) {
    const navigate = useNavigate()
    const [email, setEmail] = useState("") 
    const [password, setPassword] = useState("")
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const handleSubmit = async(e) => {
    e.preventDefault();
    let endpoint = isSignUp ? "/signup" : "/login";
    await axios.post(`http://localhost:5000${endpoint}`, { email, password })
    .then ((res) => {
        if (isSignUp) {
            // After successful signup, show success message and switch to login
            setSuccessMessage("Signup Successful! Please login with your credentials.")
            setIsSignUp(false) // Switch to login mode
            setEmail("")
            setPassword("")
            setError("")
        } else {
        // Login success
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.newUser || res.data.user));
            if (onLoginSuccess) {
                onLoginSuccess(res.data.newUser || res.data.user, isSignUp);
            }
            // Dispatch custom event for same-tab login detection
            window.dispatchEvent(new Event('userLogin'));
            // Close modal and navigate to home
            setIsOpen(false)
            navigate('/')
        }
    })
    .catch((err) => {
        setError(err.response?.data?.message || "An error occurred")
        setSuccessMessage("")
    })
    }
  
    const toggleMode = () => {
        setIsSignUp(!isSignUp)
        setError("")
        setSuccessMessage("")
    }
 
  return (
    <>
        <form className='form' onSubmit={handleSubmit}>
            <h2>{(isSignUp) ? "Sign Up" : "Login"}</h2>
            <div className='form-control'>
                <label>Email</label>
                <input type="email" className='input' value={email} onChange={(e)=>setEmail(e.target.value)} required></input>
            </div>
            <div className='form-control'>
                <label>Password</label>
                <input type="password" className='input' value={password} onChange={(e)=>setPassword(e.target.value)} required></input>
            </div>
            <button type= 'submit'>{(isSignUp) ? "SignUp" : "Login"}</button><br></br>
            { (successMessage!="") && <h6 className='success'>{successMessage}</h6> }
            { (error!="") && <h6 className='error'>{error}</h6> }
            <p onClick={toggleMode}>{(isSignUp) ? "Already have an account? Login" : "Create new account"} </p>
        </form>
    </>
  )
}
