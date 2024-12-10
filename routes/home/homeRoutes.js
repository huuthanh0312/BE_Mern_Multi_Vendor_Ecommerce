const homeController = require('../../controllers/home/homeController')
const { authMiddleware } = require('../../middlewares/authMiddleware')

const router = require('express').Router()

//RESTful API
//Retrieve All GET category
router.get('/categories', homeController.getCategories)

//Retrieve All GET product
router.get('/products', homeController.getProducts)

//Retrieve All GET product by Price Range
router.get('/products/price-range', homeController.priceRangeProduct)

// Get Product query
router.get('/products/query', homeController.queryProducts)

// Product Details by slug
router.get('/products/details/:slug', homeController.productDetails)

//Fetch customer product details add review
router.post('/customers/review', homeController.customerReview)

//Fetch customer product details get reviews
router.get('/customers/reviews/:productId', homeController.getReviews)


module.exports = router