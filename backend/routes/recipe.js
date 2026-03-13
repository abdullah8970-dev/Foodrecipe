const express = require('express');
const { getRecipes } = require('../middleware/controller/recipe');
const { getMyRecipes } = require('../middleware/controller/recipe');
const { getRecipe } = require('../middleware/controller/recipe');
const { addRecipe } = require('../middleware/controller/recipe');
const { updateRecipe } = require('../middleware/controller/recipe');
const { deleteRecipe } = require('../middleware/controller/recipe');
const Recipe = require('../models/recipe');
const authMiddleware = require('../middleware/auth');



const router = express.Router();


router.get ("/" ,getRecipes); // get all recipes
router.get ("/my", authMiddleware, getMyRecipes); // get current user's recipes
router .get ("/:id" ,getRecipe); // get recipe by id
router .post ("/" ,authMiddleware, addRecipe); // create a new recipe
router.put("/:id", authMiddleware, updateRecipe); // update a recipe by id

// Allow PUT /recipe without ID, return error
router.put("/", (req, res) => {
	res.status(400).json({ message: "Recipe ID is required in the URL (PUT /recipe/:id)" });
});
router.delete("/:id", authMiddleware, deleteRecipe); // delete a recipe by id

module.exports = router;
