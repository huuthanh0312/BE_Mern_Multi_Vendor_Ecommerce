const authControllers = require('../controllers/authControllers')
const { authMiddleware } = require('../middlewares/authMiddleware')

const router = require('express').Router()

router.post('/admin-login', authControllers.admin_login)
router.get('/get-user', authMiddleware, authControllers.getUser)
router.post('/seller-register', authControllers.seller_register)
router.post('/seller-login', authControllers.seller_login)
// upload seller image
router.post('/seller/profile/image-upload', authMiddleware, authControllers.uploadSellerProfileImage)
// change seller info
router.post('/seller/profile/info', authMiddleware, authControllers.changeSellerInfo)

module.exports = router