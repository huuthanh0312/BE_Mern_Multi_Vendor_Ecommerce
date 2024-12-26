const sellerController = require('../../controllers/dashboard/sellerController')
const { authMiddleware } = require('../../middlewares/authMiddleware')
const router = require('express').Router()

//RESTful API
//Retrieve All GET
router.get('/get-sellers', authMiddleware, sellerController.getSellers)
//Get Info Seller By Id
router.get('/get-sellers/:sellerId', authMiddleware, sellerController.getSeller)
//Update Status Seller By Id for Admin
router.post('/sellers-update-status', authMiddleware, sellerController.updateSellerStatus)

// Get List Seller Active
router.get('/get-active-sellers', authMiddleware, sellerController.getActiveSellers)
// Get List Seller DeActive
router.get('/get-deactive-sellers', authMiddleware, sellerController.getDeactiveSellers)

module.exports = router
