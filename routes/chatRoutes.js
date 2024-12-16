const chatController = require('../controllers/chatController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const router = require('express').Router()

//RESTful API

// API Chat By Customers
//Cutomer add connect seller
router.post('/home/chat/customers/add-friend', chatController.addCustomerFriend)

//Customer send message to seller
router.post('/home/chat/customers/send-message-to-seller', chatController.customerSendMessage)

// API Chat By Sellers
// Get All Customers Add Connection by Seller
router.get('/chat/sellers/get-customers/:sellerId', chatController.getCustomersBySeller)
// Get Customer By Id For Customers
router.get(
  '/chat/sellers/get-customers-messages/:customerId',
  authMiddleware,
  chatController.getCustomerMessagesBySeller
)
//Seller Send message to customer
router.post(
  '/chat/sellers/send-message-to-customer',
  authMiddleware,
  chatController.sellerSendMessageToCustomer
)

module.exports = router
