
import React from 'react'
import './assets/App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import MyRecipe from './pages/MyRecipe.jsx'
import MainNavigation from './components/MainNavigation.jsx'
import AddRecipePage from './pages/AddRecipePage.jsx'
import FavoriteRecipes from './pages/FavoriteRecipes.jsx'
import RecipeDetail from './pages/RecipeDetail.jsx'
import axios from 'axios'

const getAllRecipes=async()=>{
  try {
    const response = await axios.get('http://localhost:5000/recipe')
    return response.data
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return []
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainNavigation />,
    children: [
      { path: "/", element: <Home />, loader: getAllRecipes, hydrateFallbackElement: <div>Loading...</div> },
      { path: "myRecipe", element: <MyRecipe /> },
      { path: "add-recipe", element: <AddRecipePage /> },
      { path: "favRecipe", element: <FavoriteRecipes /> },
      { path: "recipe/:id", element: <RecipeDetail /> }
    ]
  }
])

export default function App() {
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

