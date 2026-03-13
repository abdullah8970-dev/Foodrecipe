import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'
import '../assets/App.css'

export default function MainNavigation() {
  return (
   <div className="main-navigation">
    <Navbar/>
    <div className="content-wrapper">
      <Outlet/>
    </div>
    <Footer/>
   </div>
  )
}
