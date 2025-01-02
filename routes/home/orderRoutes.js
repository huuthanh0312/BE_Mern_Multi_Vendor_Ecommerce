const orderController = require('../../controllers/home/orderController')
const { customerAuthMiddleware } = require('../../middlewares/customerAuthMiddleware ')

const router = require('express').Router()

//RESTful API
//Order Request place order
router.post('/home/order/place-order', customerAuthMiddleware, orderController.placeOrder)

//Order Request place order
router.get(
  '/home/customer/get-dashboard-data/:userId',
  customerAuthMiddleware,
  orderController.getDashBoardIndexData
)

// get Orders By Status Customers Handle
router.get(
  '/home/order/orders-by-status/:customerId/:status',
  customerAuthMiddleware,
  orderController.getOrdersByStatus
)

// get Orders Details Customers Handle
router.get('/home/order/details/:orderId', customerAuthMiddleware, orderController.getOrderDetails)

//Create  Payment
router.post('/order/create-payment', customerAuthMiddleware, orderController.createPayment)

router.get('/order/confirm/:orderId', orderController.orderConfirmPayment)

module.exports = router
