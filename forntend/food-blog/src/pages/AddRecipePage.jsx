import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AddRecipePage() {
  const [recipe, setRecipe] = useState({
    title: '',
    time: '',
    ingredients: '',
    instructions: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setRecipe((prev) => ({ ...prev, file: files[0] }));
    } else {
      setRecipe((prev) => ({ ...prev, [name]: value }));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let coverImage = '';
      if (recipe.file) {
        coverImage = await convertToBase64(recipe.file);
      }
      const formData = {
        title: recipe.title,
        time: recipe.time,
        ingredients: recipe.ingredients.split(',').map(item => item.trim()),
        instructions: recipe.instructions,
        coverImage
      };
      await axios.post('http://localhost:5000/recipe', formData, {
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'bearer ' + localStorage.getItem('token')
        }
      });
      setLoading(false);

      navigate('/');
      
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || 'Error adding recipe. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: '90%', maxWidth: '900px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.2rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ fontWeight: '500', textAlign: 'right' }}>Title</label>
          <input type="text" name="title" value={recipe.title} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.2rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ fontWeight: '500', textAlign: 'right' }}>Time</label>
          <input type="text" name="time" value={recipe.time} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.2rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ fontWeight: '500', textAlign: 'right' }}>Ingredients</label>
          <textarea name="ingredients" value={recipe.ingredients} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.2rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ fontWeight: '500', textAlign: 'right' }}>Instructions</label>
          <textarea name="instructions" value={recipe.instructions} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.2rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ fontWeight: '500', textAlign: 'right' }}>Recipe Image</label>
          <input type="file" name="file" onChange={handleChange} style={{ width: '100%' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button type="submit" style={{ padding: '10px 32px', borderRadius: '6px', background: '#d4f6e8', color: '#213547', border: 'none', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 1px 5px rgba(0,0,0,0.12)' }} disabled={loading}>{loading ? 'Adding...' : 'Add Recipe'}</button>
        </div>
      </form>
    </div>
  );
}
