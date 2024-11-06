const categoryController = require('../../controllers/dashboard/categoryController')
const { authMiddleware } = require('../../middlewares/authMiddleware')

const router = require('express').Router()

//RESTful API
// Create	POST
router.post('/categories', authMiddleware, categoryController.addCategory)
//Retrieve All	GET
router.get('/categories', authMiddleware, categoryController.getCategory)

module.exports = router