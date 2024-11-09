const productController = require('../../controllers/dashboard/productController')
const { authMiddleware } = require('../../middlewares/authMiddleware')

const router = require('express').Router()

//RESTful API
// Create	POST Product 
router.post('/products', authMiddleware, productController.addProduct)
//Retrieve All GET Product
router.get('/products', authMiddleware, productController.getProducts)
// Get Product By Id
router.get('/products/:productId', authMiddleware, productController.getProduct)
// Put Update Product By Id
router.put('/products/:productId', authMiddleware, productController.updateProduct)
// Update Image Product By Id
router.put('/products/:productId/image', authMiddleware, productController.updateProductImage)

module.exports = router