const orderController = require('../../controllers/dashboard/orderController')
const { authMiddleware } = require('../../middlewares/authMiddleware')
const router = require('express').Router()

//RESTful API
//For Admin orders
//Get Admin List Order
router.get('/admin/orders', authMiddleware, orderController.getAdminOrders)
//Get Admin Order By Id
router.get('/admin/orders/:orderId', authMiddleware, orderController.getAdminOrderById)
//PUT Admin update status orders
router.put(
  '/admin/orders/status-update/:orderId',
  authMiddleware,
  orderController.updateAdminStatusOrder
)

// For Seller orders
//Get Seller List Order
router.get('/seller/:sellerId/orders', authMiddleware, orderController.getSellerOrders)
//Get Seller Order By Id
router.get('/seller/orders/:orderId', authMiddleware, orderController.getSellerOrderById)
//PUT Seller update status orders
router.put(
  '/seller/orders/status-update/:orderId',
  authMiddleware,
  orderController.updateSellerStatusOrder
)

module.exports = router
