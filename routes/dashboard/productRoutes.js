const productController = require('../../controllers/dashboard/productController')
const { authMiddleware } = require('../../middlewares/authMiddleware')

const router = require('express').Router()

//RESTful API
// Create	POST Product 
router.post('/products', authMiddleware, productController.addProduct)
//Retrieve All GET Product
router.get('/products', authMiddleware, productController.getProduct)

module.exports = router