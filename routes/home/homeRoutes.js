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

router.get('/products/query', homeController.queryProducts)

module.exports = router