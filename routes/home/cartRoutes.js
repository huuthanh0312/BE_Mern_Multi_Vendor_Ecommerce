const cartController = require('../../controllers/home/cartController')
const { customerAuthMiddleware } = require('../../middlewares/customerAuthMiddleware ')


const router = require('express').Router()

//RESTful API
//Add Cart To Product
router.post('/home/cart/add', customerAuthMiddleware, cartController.addToCart)

// Get Product To Cart 
router.get('/home/cart/get-products/:userId', customerAuthMiddleware, cartController.getCartProducts)

// Delete Product To Cart 
router.delete('/home/cart/delete-product/:cartId', customerAuthMiddleware, cartController.deleteCartProduct)

// Cart Product Quantity Oncrease
router.put('/home/cart/quantity-increase/:cartId', cartController.quantityIncrease)

// Cart Product Quantity Decrease
router.put('/home/cart/quantity-decrease/:cartId', cartController.quantityDecrease)

// Wishlist
// Add To Wishlist
router.post('/home/products/wishlist', customerAuthMiddleware, cartController.addToWishlist)

//Get Wishlist Products
router.get('/home/products/wishlist/:userId', customerAuthMiddleware, cartController.getWishlistProducts)

//Remove Wishlist Products
router.delete('/home/products/wishlist/:wishlistId', customerAuthMiddleware, cartController.removeWishlistProduct)




module.exports = router