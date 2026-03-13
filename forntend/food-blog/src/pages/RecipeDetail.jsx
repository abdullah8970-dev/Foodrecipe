import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BsStopwatchFill } from "react-icons/bs"
import { FaHeart, FaArrowLeft } from "react-icons/fa"

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/recipe/${id}`)
        setRecipe(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching recipe:', err)
        setError('Recipe not found')
        setLoading(false)
      }
    }

    const checkFavorite = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const response = await axios.get('http://localhost:5000/favorites/ids', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const favorites = response.data.favorites || []
        setIsFavorited(favorites.some(favId => favId.toString() === id.toString()))
      } catch (err) {
        console.error('Error checking favorite:', err)
      }
    }

    const checkUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser && storedUser !== 'undefined') {
        try {
          setUser(JSON.parse(storedUser))
        } catch (err) {
          setUser(null)
        }
      }
    }

    fetchRecipe()
    checkFavorite()
    checkUser()
  }, [id])

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to add favorites!')
      return
    }

    try {
      const response = await axios.post('http://localhost:5000/favorites/toggle',
        { recipeId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIsFavorited(response.data.favorites?.includes(id) || false)
      alert(response.data.message || 'Favorite updated')
    } catch (err) {
      console.error('Error toggling favorite:', err)
      if (err.response?.status === 401) {
        alert('Please login to add favorites!')
      }
    }
  }

  const goBack = () => {
    navigate(-1)
  }

  // Get image source helper
  const getImageSrc = (coverImage) => {
    if (!coverImage) return 'https://via.placeholder.com/400x300?text=No+Image'
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
      return coverImage
    }
    if (coverImage.startsWith('data:')) {
      return coverImage
    }
    if (coverImage.length > 50 && /^[A-Za-z0-9+/=]+$/.test(coverImage.substring(0, 100))) {
      return `data:image/jpeg;base64,${coverImage}`
    }
    return coverImage
  }

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
  }

  if (loading) {
    return (
      <div className="recipe-detail-loading" style={{ marginTop: '70px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="recipe-detail-error" style={{ marginTop: '70px', textAlign: 'center' }}>
        <h2>{error}</h2>
        <button onClick={goBack} style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="recipe-detail-page" style={{ marginTop: '70px', padding: '15px', minHeight: 'calc(100vh - 130px)' }}>
      <button 
        onClick={goBack} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '10px 20px', 
          cursor: 'pointer',
          background: '#213547',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      >
        <FaArrowLeft /> Back
      </button>

      <div className="recipe-detail-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="recipe-detail-card" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
        }}>
          <div className="recipe-detail-image" style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
            <img 
              src={getImageSrc(recipe.coverImage)} 
              alt={recipe.title}
              onError={handleImageError}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <div className="recipe-detail-content" style={{ padding: '2rem' }}>
            <div className="recipe-detail-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #d4f6e8'
            }}>
              <h2 style={{ color: '#213547', fontSize: '2rem', margin: 0 }}>{recipe.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: '#666', 
                  fontSize: '1rem',
                  backgroundColor: '#d4f6e8',
                  padding: '8px 16px',
                  borderRadius: '20px'
                }}>
                  <BsStopwatchFill /> {recipe.time}
                </div>
                <FaHeart 
                  onClick={handleToggleFavorite}
                  style={{ 
                    color: isFavorited ? 'red' : 'gray', 
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
            </div>

            <div className="recipe-detail-section" style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                color: '#213547', 
                fontSize: '1.3rem', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '4px', 
                  height: '24px', 
                  backgroundColor: '#d4f6e8',
                  borderRadius: '2px'
                }}></span>
                Ingredients
              </h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px' 
              }}>
                {Array.isArray(recipe.ingredients) ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li key={index} style={{ 
                      backgroundColor: '#f0fdf4', 
                      color: '#166534', 
                      padding: '8px 16px', 
                      borderRadius: '20px', 
                      fontSize: '0.95rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      {ingredient}
                    </li>
                  ))
                ) : (
                  <li style={{ 
                    backgroundColor: '#f0fdf4', 
                    color: '#166534', 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    fontSize: '0.95rem'
                  }}>
                    {recipe.ingredients}
                  </li>
                )}
              </ul>
            </div>

            <div className="recipe-detail-section">
              <h3 style={{ 
                color: '#213547', 
                fontSize: '1.3rem', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '4px', 
                  height: '24px', 
                  backgroundColor: '#d4f6e8',
                  borderRadius: '2px'
                }}></span>
                Instructions
              </h3>
              <div style={{ 
                color: '#555', 
                fontSize: '1rem', 
                lineHeight: '1.8', 
                backgroundColor: '#f8fafc', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                borderLeft: '4px solid #d4f6e8',
                whiteSpace: 'pre-wrap'
              }}>
                {recipe.instructions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

