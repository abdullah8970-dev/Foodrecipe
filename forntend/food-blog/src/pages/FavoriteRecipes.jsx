
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeItems from '../components/RecipeItems';

export default function FavoriteRecipes() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchFavorites = async () => {
    const token = getToken();
    
    if (!token) {
      setLoading(false);
      setFavorites([]);
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    
    fetchFavorites();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      fetchFavorites();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event when user logs in
    const handleUserLogin = () => {
      handleStorageChange();
    };
    window.addEventListener('userLogin', handleUserLogin);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  if (loading) {
    return (
      <div className="my-recipe-page">
        <div className="my-recipe-header">
          <h1>My Favorites</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-recipe-page">
        <div className="my-recipe-header">
          <h1>My Favorites</h1>
          <p>Please login to view your favorites!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-recipe-page">
      <div className="my-recipe-header">
        <h1>My Favorites</h1>
        <p>Your favorite recipes in one place!</p>
      </div>
      
      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No favorites yet. Click the heart icon on recipes to add them here!</p>
        </div>
      ) : (
        <div className='recipe' style={{ width: '90%', maxWidth: '1200px', margin: 'auto' }}>
          <RecipeItems recipes={favorites} />
        </div>
      )}
    </div>
  );
}

