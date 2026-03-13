import React, { useState, useEffect } from 'react';
import { BsStopwatchFill } from "react-icons/bs";
import { FaHeart, FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import axios from 'axios';
import Toast from './Toast';
import { useNavigate } from 'react-router-dom';

export default function RecipeItems({ recipes, showAllRecipes = true, showActions = false, onRecipeUpdate, onRecipeDelete }) {
    const allRecipes = recipes || [];
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    
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
    
    // Toast state
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    
    // Get token from localStorage
    const getToken = () => localStorage.getItem('token');
    
    // Show toast message
    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
    };
    
    // Fetch user's favorite IDs - runs on mount and when recipes or user changes
    useEffect(() => {
        const fetchFavorites = async () => {
            const token = getToken();
            if (!token) {
                setFavoriteIds([]);
                return;
            }
            
            try {
                const response = await axios.get('http://localhost:5000/favorites/ids', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFavoriteIds(response.data.favorites || []);
            } catch (error) {
                console.error('Error fetching favorites:', error);
                setFavoriteIds([]);
            }
        };
        
        fetchFavorites();
    }, [recipes, user]);
    
    // Listen for user authentication changes
    useEffect(() => {
        const handleStorageChange = () => {
            const token = getToken();
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined') {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    setUser(null);
                }
            } else {
                setUser(null);
                setFavoriteIds([]);
            }
        };
        
        // Check on mount and when localStorage might change
        handleStorageChange();
        
        // Listen for storage events (when user logs in/out)
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom event when user logs in
        const handleUserLogin = () => {
            handleStorageChange();
        };
        window.addEventListener('userLogin', handleUserLogin);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLogin', handleUserLogin);
        };
    }, []);
    
    // Check if a recipe is favorited
    const isFavorited = (recipeId) => {
        return favoriteIds.some(id => id.toString() === recipeId.toString());
    };
    
    // Toggle favorite
    const handleToggleFavorite = async (recipeId, e) => {
        e.stopPropagation();
        const token = getToken();
        
        if (!token) {
            alert('Please login to add favorites!');
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/favorites/toggle',
                { recipeId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setFavoriteIds(response.data.favorites || []);
            showToast(response.data.message || 'Favorite updated');
        } catch (error) {
            console.error('Error toggling favorite:', error);
            if (error.response?.status === 401) {
                alert('Please login to add favorites!');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Handle card click - navigate to recipe detail
    const handleCardClick = (recipeId) => {
        navigate(`/recipe/${recipeId}`);
    };
    
    // Handle edit click - start inline editing
    const handleEditClick = (recipe, e) => {
        e.stopPropagation();
        setEditingRecipeId(recipe._id || recipe.id);
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
    const handleDeleteClick = async (recipeId, e) => {
        e.stopPropagation();
        
        if (!window.confirm('Are you sure you want to delete this recipe?')) {
            return;
        }
        
        const token = getToken();
        if (!token) {
            alert('Please login to delete recipes!');
            return;
        }
        
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/recipe/${recipeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            showToast('Recipe deleted successfully');
            
            // Notify parent to refresh
            if (onRecipeDelete) {
                onRecipeDelete(recipeId);
            }
        } catch (error) {
            console.error('Error deleting recipe:', error);
            showToast(error.response?.data?.message || 'Error deleting recipe', 'error');
        } finally {
            setLoading(false);
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
            const currentRecipe = allRecipes.find(r => (r._id || r.id) === editingRecipeId);
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
            
            // Notify parent to refresh
            if (onRecipeUpdate) {
                onRecipeUpdate(response.data);
            }
            
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
    
    // Helper function to get valid image URL
    const getImageSrc = (coverImage) => {
        if (!coverImage) return null;
        
        // If it's already a valid URL (not Base64), return as is
        if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
            return coverImage;
        }
        
        // If it already has data URL prefix, return as is
        if (coverImage.startsWith('data:')) {
            return coverImage;
        }
        
        // If it looks like a Base64 string (contains only base64 chars), add the prefix
        // Check if it has common Base64 patterns
        if (coverImage.length > 50 && /^[A-Za-z0-9+/=]+$/.test(coverImage.substring(0, 100))) {
            return `data:image/jpeg;base64,${coverImage}`;
        }
        
        // Otherwise return as is (could be a path or other format)
        return coverImage;
    };
    
    // Error handler for broken images
    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/120x100?text=No+Image';
    };
    
    // Render normal card
    const renderCard = (item, index) => {
        const imageSrc = getImageSrc(item.coverImage);
        const favorited = isFavorited(item._id || item.id);
        const recipeId = item._id || item.id;
        const isEditing = editingRecipeId === recipeId;
        
        // If editing this card, render inline edit form
        if (isEditing) {
            return (
                <div key={index} className='card editing-card'>
                    <form onSubmit={handleEditSubmit} className="inline-edit-card-form">
                        <div className="edit-card-image">
                            {editForm.file ? (
                                <img 
                                    src={URL.createObjectURL(editForm.file)} 
                                    alt={editForm.title}
                                />
                            ) : (
                                <img 
                                    src={imageSrc || 'https://via.placeholder.com/120x100?text=No+Image'} 
                                    alt={item.title || 'Recipe'}
                                />
                            )}
                        </div>
                        <div className='card-body edit-card-body'>
                            <input 
                                type="text" 
                                name="title" 
                                value={editForm.title} 
                                onChange={handleEditChange} 
                                required 
                                className="inline-card-input"
                                placeholder="Title"
                            />
                            <input 
                                type="text" 
                                name="time" 
                                value={editForm.time} 
                                onChange={handleEditChange} 
                                required 
                                className="inline-card-input"
                                placeholder="Time"
                            />
                            <textarea 
                                name="ingredients" 
                                value={editForm.ingredients} 
                                onChange={handleEditChange} 
                                required 
                                className="inline-card-textarea"
                                placeholder="Ingredients (comma separated)"
                            />
                            <textarea 
                                name="instructions" 
                                value={editForm.instructions} 
                                onChange={handleEditChange} 
                                required 
                                className="inline-card-textarea"
                                placeholder="Instructions"
                            />
                            <input 
                                type="file" 
                                name="file" 
                                onChange={handleEditChange}
                                accept="image/*"
                                className="inline-card-file"
                            />
                            <div className='inline-edit-card-actions'>
                                <button 
                                    type="submit" 
                                    className="save-card-btn"
                                    disabled={editLoading}
                                >
                                    <FaSave /> {editLoading ? '...' : 'Save'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleCancelEdit}
                                    className="cancel-card-btn"
                                    disabled={editLoading}
                                >
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            );
        }
        
        // Normal display mode
        return (
            <div key={index} className='card'>
                <img 
                    src={imageSrc || 'https://via.placeholder.com/120x100?text=No+Image'} 
                    style={{ width: '120px', height: '100px', objectFit: 'cover' }}
                    alt={item.title || 'Recipe'}
                    onError={handleImageError}
                ></img>
                <div className='card-body'>
                    <div className='title'>{item.title}</div>
                    <div className='icons'>
                        <div className='timer'><BsStopwatchFill />{item.time}</div>
                        <FaHeart 
                            onClick={(e) => handleToggleFavorite(item._id || item.id, e)}
                            style={{ 
                                color: favorited ? 'red' : 'gray',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'color 0.3s ease'
                            }}
                        />

                    </div>
                    
                    {showActions && (
                        <div className='card-actions'>
                            <FaEdit 
                                className='action-icon edit-icon'
                                onClick={(e) => handleEditClick(item, e)}
                                title="Edit Recipe"
                            />
                            <FaTrash 
                                className='action-icon delete-icon'
                                onClick={(e) => handleDeleteClick(item._id || item.id, e)}
                                title="Delete Recipe"
                            />
                        </div>
                    )}

                </div>
            </div>
        );
    };
    
  return (
    <>
    {toast.visible && (
        <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
        />
    )}
    
    <div className='card-container'>
        {allRecipes?.map((item, index) => renderCard(item, index))}
    </div>
    </>
  );
}

