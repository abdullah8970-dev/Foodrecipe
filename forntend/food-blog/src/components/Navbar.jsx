import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Modal from './Modal'
import InputForm from './InputForm'
import Toast from './Toast'

export default function Navbar() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing user from localStorage:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const checkLogin = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleLoginSuccess = (userData, isSignup = false) => {
    setUser(userData)
    const message = isSignup ? 'Signup Successfully!' : 'Login Successfully!'
    setToastMessage(message)
    setShowToast(true)
    setIsOpen(false)
    // Navigate to home page after successful login/signup
    navigate('/')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToastMessage('Logged out successfully!')
    setShowToast(true)
    // Navigate to home page after logout
    navigate('/')
  }

  const closeToast = () => {
    setShowToast(false)
  }

  const getUserInitial = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase()
    }
    if (user && user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (user && user.name) {
      return user.name
    }
    if (user && user.email) {
      return user.email
    }
    return 'User'
  }

  return (
    <>
        <header>
            <h2 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Pizza's Blog</h2>
            <ul style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: 0 }}>
                <li><NavLink to="/" style={{ textDecoration: 'none', color: 'black', padding: '2px 10px', borderRadius: '10px' }} onClick={() => navigate('/')}>Home</NavLink></li>
                <li><NavLink to="/myRecipe" style={{ textDecoration: 'none', color: 'black', padding: '2px 10px', borderRadius: '10px' }} onClick={() => navigate('/myRecipe')}>My Recipe</NavLink></li>
                <li><NavLink to="/favRecipe" style={{ textDecoration: 'none', color: 'black', padding: '2px 10px', borderRadius: '10px' }} onClick={() => navigate('/favRecipe')}>Favourites</NavLink></li>
                {user ? (
                  <li className="user-profile-section">
                    <div className="user-profile">
                      <div className="user-avatar">{getUserInitial()}</div>
                      <div className="user-info">
                        <span className="user-name">{getUserDisplayName()}</span>
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li onClick={checkLogin}><p className='login'>Login</p></li>
                )}
            </ul>
        </header>
        {isOpen && <Modal onClose={handleClose}><InputForm setIsOpen={handleClose} onLoginSuccess={handleLoginSuccess}/></Modal>}
        {showToast && <Toast message={toastMessage} type="success" onClose={closeToast} />}
    </>
  )
}

