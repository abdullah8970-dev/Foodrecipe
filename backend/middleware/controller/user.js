const User = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSignup = async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password)
    {
        return res.status(400).json({message:"Email and password are required"})
    }
    let user = await User.findOne({email});
    if(user)
    {
        return res.status(400).json({message:"User already exists"})
    }
    const hashedPassword = await bcrypt.hash(String(password), 10);
    const newUser = await User.create({
        email,password:hashedPassword
    })
    let token = jwt.sign({email, id:newUser._id},process.env.JWT_SECRET || "default_secret_key_123",{expiresIn:"1h"})
    return res.status(200).json({token,newUser})
   
}
const userLogin = async(req,res)=>{


    const {email,password}=req.body;
    if(!email || !password)
    {
        return res.status(400).json({message:"Email and password are required"})
    }

    let user = await User.findOne({email});
    if(user && await bcrypt.compare(String(password), user.password)){
        let token = jwt.sign({email, id:user._id},process.env.JWT_SECRET || "default_secret_key_123",{expiresIn:"1h"})
        return res.status(200).json({token, user});
    }
    else{
        return res.status(400).json({message:"Invalid Credentials"})
    }
   


}
const getUser = async(req,res)=>{

}

// Toggle favorite recipe for user
const toggleFavorite = async(req, res) => {
    try {
        const { recipeId } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        
        if (!recipeId) {
            return res.status(400).json({ message: "Recipe ID is required" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const favoriteIndex = user.favorites.indexOf(recipeId);
        
        if (favoriteIndex === -1) {
            // Add to favorites
            user.favorites.push(recipeId);
        } else {
            // Remove from favorites
            user.favorites.splice(favoriteIndex, 1);
        }
        
        await user.save();
        
        return res.status(200).json({ 
            message: favoriteIndex === -1 ? "Added to favorites" : "Removed from favorites",
            favorites: user.favorites 
        });
    } catch (err) {
        console.error('Error toggling favorite:', err);
        return res.status(500).json({ message: "Error toggling favorite" });
    }
};

// Get user's favorite recipes
const getFavorites = async(req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        
        const user = await User.findById(userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        console.error('Error fetching favorites:', err);
        return res.status(500).json({ message: "Error fetching favorites" });
    }
};

// Get user's favorite recipe IDs (for checking which recipes are favorited)
const getFavoriteIds = async(req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(200).json({ favorites: [] });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(200).json({ favorites: [] });
        }
        
        return res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        console.error('Error fetching favorite IDs:', err);
        return res.status(500).json({ message: "Error fetching favorite IDs" });
    }
};

module.exports = {userSignup, userLogin, getUser, toggleFavorite, getFavorites, getFavoriteIds};
