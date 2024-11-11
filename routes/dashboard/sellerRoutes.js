const sellerController = require('../../controllers/dashboard/sellerController')
const { authMiddleware } = require('../../middlewares/authMiddleware')
const router = require('express').Router()

//RESTful API
//Retrieve All	GET
router.get('/sellers', authMiddleware, sellerController.getSellers)
//Get Info Seller By Id
router.get('/sellers/:sellerId', authMiddleware, sellerController.getSeller)
//Update Status Seller By Id for Admin
router.post('/sellers/update-status', authMiddleware, sellerController.updateSellerStatus)

module.exports = router