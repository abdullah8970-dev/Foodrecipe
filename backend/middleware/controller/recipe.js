const Recipe = require("../../models/recipe");
const mongoose = require("mongoose");

// Helper function to check if ID is a valid MongoDB ObjectId (24 char hex)
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper function to check if ID is a valid format (MongoDB ObjectId OR custom string ID)
const isValidRecipeId = (id) => {
  // Allow MongoDB ObjectIds (24 char hex)
  if (isValidObjectId(id)) {
    return true;
  }
  // Allow custom string IDs (like 'pizza1', 'pizza2', etc.)
  if (typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id)) {
    return true;
  }
  return false;
};

// Helper function to find recipe by ID (handles both MongoDB ObjectId and custom string ID)
const findRecipeById = async (id) => {
  if (isValidObjectId(id)) {
    return await Recipe.findById(id);
  } else {
    return await Recipe.findOne({ _id: id });
  }
};

const getRecipes = async(req, res) => {
  try {
    const recipes = await Recipe.find().populate('user', 'email');
    return res.json(recipes);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    return res.status(500).json({ message: 'Error fetching recipes' });
  }
}

const getMyRecipes = async (req, res) => {
  try {
    // Get user ID from the decoded token in req.user
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const recipes = await Recipe.find({ user: userId }).populate('user', 'email');
    return res.json(recipes);
  } catch (err) {
    console.error('Error fetching my recipes:', err);
    return res.status(500).json({ message: 'Error fetching your recipes' });
  }
}

const getRecipe = async(req, res) => {
  // Validate recipe ID format (MongoDB ObjectId OR custom string ID)
  if (!isValidRecipeId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe ID format' });
  }
  
  const recipe = await findRecipeById(req.params.id);
  res.json(recipe || null);

};


const addRecipe = async (req, res) => {
  let { title, ingredients, instructions, time, coverImage } = req.body;
  
  // Only require essential fields - coverImage is now optional
  if (!title || !ingredients || !instructions || !time) {
    return res.status(400).json({ message: 'Title, ingredients, instructions, and time are required' });
  }
  
  // Ensure ingredients is always an array
  if (typeof ingredients === 'string') {
    ingredients = ingredients.split(',').map(item => item.trim()).filter(Boolean);
  }
  
  // Set default coverImage if not provided
  if (!coverImage) {
    coverImage = '';
  }
  
  try {
    // Get user ID from the decoded token
    const userId = req.user?.id || req.user?._id;
    
    const newRecipe = await Recipe.create({ 
      title, 
      ingredients, 
      instructions, 
      time, 
      coverImage,
      user: userId || null
    });
    return res.status(201).json(newRecipe);
  } catch (err) {
    console.error('Error creating recipe:', err);
    return res.status(500).json({ message: 'Error creating recipe', error: err.message });
  }
};


const updateRecipe = async (req, res) => {
  const { title, ingredients, instructions, time, coverImage } = req.body;
  const userId = req.user?.id || req.user?._id;
  const userEmail = req.user?.email;
  
  // Validate recipe ID format (MongoDB ObjectId OR custom string ID)
  if (!isValidRecipeId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe ID format' });
  }
  
  // Check if user is authenticated
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated. Please login to update recipes.' });
  }
  
  try {
    // Ensure ingredients is an array
    const recipeData = {
      title,
      time,
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(item => item.trim()).filter(Boolean),
      instructions,
      coverImage: coverImage || '',
      user: userId
    };
    
    let recipe;
    if (isValidObjectId(req.params.id)) {
      recipe = await Recipe.findByIdAndUpdate(req.params.id, recipeData, { new: true, upsert: true });
    } else {
      recipe = await Recipe.findOneAndUpdate(
        { _id: req.params.id },
        recipeData,
        { new: true, upsert: true }
      );
    }
    
    return res.json(recipe);
  } catch (err) {
    console.error('Error updating recipe:', err);
    return res.status(500).json({ message: 'Error updating recipe', error: err.message });
  }


};

const deleteRecipe = async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const userEmail = req.user?.email;
  
  // Validate recipe ID format (MongoDB ObjectId OR custom string ID)
  if (!isValidRecipeId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe ID format' });
  }
  
  // Check if user is authenticated
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated. Please login to delete recipes.' });
  }
  
  // Admin email check - only admin can delete recipes
  const ADMIN_EMAILS = ['abdullahsaduzai@gmail.com', 'abdullahsaduzai6@gmail.com'];
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return res.status(403).json({ message: 'Only the admin can delete recipes.' });
  }
  
  try {
    const existingRecipe = await findRecipeById(req.params.id);
    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if recipe has a user assigned (seed recipes have no user)
    // If recipe has a user, verify ownership - if no user, allow delete
    if (existingRecipe.user) {
      const recipeUserId = existingRecipe.user.toString();
      if (recipeUserId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this recipe' });
      }
    }
    
    if (isValidObjectId(req.params.id)) {
      await Recipe.findByIdAndDelete(req.params.id);
    } else {
      await Recipe.findOneAndDelete({ _id: req.params.id });
    }
    return res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('Error deleting recipe:', err);
    return res.status(500).json({ message: 'Error deleting recipe' });
  }

};

module.exports = {
  getRecipes,
  getMyRecipes,
  getRecipe,
  addRecipe,
  updateRecipe,
  deleteRecipe,
};
