const express = require('express');
const Recipe = require('../models/recipe');
const {userLogin,userSignup,getUser,toggleFavorite,getFavorites,getFavoriteIds}=require("../middleware/controller/user")
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// router.post("/signup",userSignup);
router.post("/signUp",userSignup);
router.post("/login",userLogin);
router.get("/user/:id",getUser);

// Favorite routes
router.post("/favorites/toggle", authMiddleware, toggleFavorite);
router.get("/favorites", authMiddleware, getFavorites);
router.get("/favorites/ids", authMiddleware, getFavoriteIds);

module.exports = router;

