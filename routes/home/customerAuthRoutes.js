const customerAuthController = require('../../controllers/home/customerAuthController')
const homeController = require('../../controllers/home/homeController')
const { authMiddleware } = require('../../middlewares/authMiddleware')

const router = require('express').Router()

//RESTful API
//customer register 
router.post('/customer/register', customerAuthController.customer_register)
//customer login 
router.post('/customer/login', customerAuthController.customer_login)



module.exports = router