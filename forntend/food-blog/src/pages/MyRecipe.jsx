import React, { useState, useEffect } from 'react';
import { BsStopwatchFill } from "react-icons/bs";
import { FaHeart, FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import axios from 'axios';
import Toast from '../components/Toast';

// Static pizza recipes
const pizzaRecipes = [
  {
    _id: 'pizza1',
    title: 'Margherita Pizza',
    time: '30 min',
    coverImage: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Fresh mozzarella', 'Fresh basil', 'Olive oil', 'Salt'],
    instructions: 'Preheat oven to 475°F (245°C). Roll out pizza dough. Spread tomato sauce evenly. Add sliced mozzarella. Bake for 12-15 minutes until crust is golden. Top with fresh basil and olive oil.'
  },
  {
    _id: 'pizza2',
    title: 'Pepperoni Pizza',
    time: '35 min',
    coverImage: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Pepperoni slices', 'Italian seasoning', 'Garlic powder'],
    instructions: 'Preheat oven to 450°F (230°C). Prepare dough and sauce. Add cheese and pepperoni slices. Sprinkle with Italian seasoning. Bake for 15-18 minutes until cheese is bubbly and crust is crispy.'
  },
  {
    _id: 'pizza3',
    title: 'BBQ Chicken Pizza',
    time: '40 min',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    ingredients: ['Pizza dough', 'BBQ sauce', 'Grilled chicken breast', 'Red onions', 'Mozzarella cheese', 'Cilantro', 'Ranch dressing'],
    instructions: 'Preheat oven to 425°F (220°C). Spread BBQ sauce on dough. Top with grilled chicken, red onions, and mozzarella. Bake for 15-20 minutes. Drizzle with ranch dressing and garnish with cilantro.'
  },
  {
    _id: 'pizza4',
    title: 'Veggie Supreme Pizza',
    time: '35 min',
    coverImage: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400&h=300&fit=crop',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Bell peppers', 'Mushrooms', 'Olives', 'Onions', 'Fresh tomatoes'],
    instructions: 'Preheat oven to 450°F (230°C). Add sauce and cheese. Layer bell peppers, mushrooms, olives, onions, and tomatoes. Bake for 15-18 minutes until vegetables are tender and cheese is golden.'
  }
];

export default function MyRecipe() {
  const [recipes, setRecipes] = useState(pizzaRecipes);
  const [loading] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Inline edit state - tracks which recipe is being edited
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    time: '',
    ingredients: '',
    instructions: '',
    file: null
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Admin check state
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');
  
  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = () => {
      const token = getToken();
      if (token) {
        try {
          // Decode JWT to get user email
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const userEmail = decoded.email;
          const ADMIN_EMAILS = ['abdullahsaduzai@gmail.com', 'abdullahsaduzai6@gmail.com'];
          setIsAdmin(ADMIN_EMAILS.includes(userEmail));
        } catch (error) {
          console.error('Error decoding token:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };
  
  // Handle recipe update from edit
  const handleRecipeUpdate = (updatedRecipe) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe._id === updatedRecipe._id ? updatedRecipe : recipe
      )
    );
  };

  // Handle recipe delete
  const handleRecipeDelete = (deletedRecipeId) => {
    setRecipes(prevRecipes => 
      prevRecipes.filter(recipe => recipe._id !== deletedRecipeId)
    );
  };
  
  // Handle edit click - start inline editing
  const handleEditClick = (recipe) => {
    setEditingRecipeId(recipe._id);
    setEditForm({
      title: recipe.title || '',
      time: recipe.time || '',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients || '',
      instructions: recipe.instructions || '',
      file: null
    });
  };
  
  // Handle cancel edit - cancel inline editing
  const handleCancelEdit = () => {
    setEditingRecipeId(null);
    setEditForm({
      title: '',
      time: '',
      ingredients: '',
      instructions: '',
      file: null
    });
  };
  
  // Handle delete click
  const handleDeleteClick = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }
    
    const token = getToken();
    if (!token) {
      alert('Please login to delete recipes!');
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('Recipe deleted successfully');
      handleRecipeDelete(recipeId);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      showToast(error.response?.data?.message || 'Error deleting recipe', 'error');
    }
  };
  
  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setEditForm(prev => ({ ...prev, file: files[0] }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  
  // Handle edit submit - save inline edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      // Find the current recipe being edited
      const currentRecipe = recipes.find(r => r._id === editingRecipeId);
      let coverImage = currentRecipe?.coverImage || '';
      if (editForm.file) {
        coverImage = await convertToBase64(editForm.file);
      }
      
      const formData = {
        title: editForm.title,
        time: editForm.time,
        ingredients: editForm.ingredients.split(',').map(item => item.trim()),
        instructions: editForm.instructions,
        coverImage
      };
      
      const token = getToken();
      const response = await axios.put(`http://localhost:5000/recipe/${editingRecipeId}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      showToast('Recipe updated successfully');
      handleRecipeUpdate(response.data);
      setEditingRecipeId(null);
      setEditForm({
        title: '',
        time: '',
        ingredients: '',
        instructions: '',
        file: null
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      showToast(error.response?.data?.message || 'Error updating recipe', 'error');
    } finally {
      setEditLoading(false);
    }
  };
  
  // Get image src helper
  const getImageSrc = (coverImage) => {
    if (!coverImage) return null;
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
      return coverImage;
    }
    if (coverImage.startsWith('data:')) {
      return coverImage;
    }
    if (coverImage.length > 50 && /^[A-Za-z0-9+/=]+$/.test(coverImage.substring(0, 100))) {
      return `data:image/jpeg;base64,${coverImage}`;
    }
    return coverImage;
  };
  
  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
  };

  // Render read-only recipe content
  const renderRecipeContent = (recipe) => (
    <>
      <div className="recipe-detail-header">
        <h2>{recipe.title}</h2>
        <div className="recipe-detail-time">
          <BsStopwatchFill /> {recipe.time}
        </div>
      </div>
      
      <div className="recipe-detail-section">
        <h3>Ingredients</h3>
        <ul className="ingredients-list">
          {Array.isArray(recipe.ingredients) ? (
            recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))
          ) : (
            <li>{recipe.ingredients}</li>
          )}
        </ul>
      </div>
      
      <div className="recipe-detail-section">
        <h3>Instructions</h3>
        <p className="instructions-text">{recipe.instructions}</p>
      </div>
      
      {/* Only show Edit/Delete buttons for admin */}
      {isAdmin && (
        <div className="recipe-detail-actions">
          <button 
            className="edit-btn"
            onClick={() => handleEditClick(recipe)}
          >
            <FaEdit /> Edit
          </button>
          <button 
            className="delete-btn"
            onClick={() => handleDeleteClick(recipe._id)}
          >
            <FaTrash /> Delete
          </button>
        </div>
      )}
    </>
  );

  // Render inline edit form
  const renderEditForm = () => (
    <form onSubmit={handleEditSubmit} className="inline-edit-form">
      <div className="inline-edit-header">
        <input 
          type="text" 
          name="title" 
          value={editForm.title} 
          onChange={handleEditChange} 
          required 
          className="inline-input inline-input-title"
          placeholder="Recipe Title"
        />
        <input 
          type="text" 
          name="time" 
          value={editForm.time} 
          onChange={handleEditChange} 
          required 
          className="inline-input inline-input-time"
          placeholder="Time (e.g. 30 min)"
        />
      </div>
      
      <div className="recipe-detail-section">
        <h3>Ingredients</h3>
        <textarea 
          name="ingredients" 
          value={editForm.ingredients} 
          onChange={handleEditChange} 
          required 
          className="inline-textarea"
          placeholder="Enter ingredients separated by commas"
        />
      </div>
      
      <div className="recipe-detail-section">
        <h3>Instructions</h3>
        <textarea 
          name="instructions" 
          value={editForm.instructions} 
          onChange={handleEditChange} 
          required 
          className="inline-textarea"
          placeholder="Enter cooking instructions"
        />
      </div>
      
      <div className="recipe-detail-section">
        <label className="inline-file-label">
          <span>Recipe Image</span>
          <input 
            type="file" 
            name="file" 
            onChange={handleEditChange}
            accept="image/*"
            className="inline-file-input"
          />
        </label>
      </div>
      
      <div className="inline-edit-actions">
        <button 
          type="submit" 
          className="save-btn"
          disabled={editLoading}
        >
          <FaSave /> {editLoading ? 'Saving...' : 'Save'}
        </button>
        <button 
          type="button" 
          onClick={handleCancelEdit}
          className="cancel-btn"
          disabled={editLoading}
        >
          <FaTimes /> Cancel
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="my-recipe-page">
        <div className="my-recipe-header">
          <h1>My Recipes</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
        />
      )}
      
      <div className="my-recipe-page">
        <div className="my-recipe-header">
          <h1>My Recipes</h1>
          <p>Your shared recipes in one place!</p>
        </div>
        
        {recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>You haven't shared any recipes yet. Share your first recipe!</p>
          </div>
        ) : (
          <div className="recipe-details-container">
            {recipes.map((recipe) => (
              <div key={recipe._id} className={`recipe-detail-card ${editingRecipeId === recipe._id ? 'editing' : ''}`}>
                <div className="recipe-detail-image">
                  {editingRecipeId === recipe._id && editForm.file ? (
                    <img 
                      src={URL.createObjectURL(editForm.file)} 
                      alt={editForm.title}
                    />
                  ) : (
                    <img 
                      src={getImageSrc(recipe.coverImage) || 'https://via.placeholder.com/400x300?text=No+Image'} 
                      alt={recipe.title}
                      onError={handleImageError}
                    />
                  )}
                </div>
                <div className="recipe-detail-content">
                  {editingRecipeId === recipe._id ? renderEditForm() : renderRecipeContent(recipe)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

