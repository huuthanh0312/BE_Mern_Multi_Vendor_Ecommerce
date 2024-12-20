const chatController = require('../controllers/chatController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const router = require('express').Router()

//// API Chat By Customers ////
//Cutomer add connect seller
router.post('/home/chat/customers/add-friend', chatController.addCustomerFriend)

//Customer send message to seller
router.post('/home/chat/customers/send-message-to-seller', chatController.customerSendMessage)

//// API Chat By Sellers  ////
// Get All Customers by Seller
router.get('/chat/sellers/get-customers/:sellerId', chatController.getCustomersBySeller)
// Get Customer By Id For Seller
router.get(
  '/chat/sellers/get-customer-messages/:customerId',
  authMiddleware,
  chatController.getCustomerMessagesBySeller
)
//Seller Send message to customer
router.post(
  '/chat/sellers/send-message-to-customer',
  authMiddleware,
  chatController.sellerSendMessageToCustomer
)

/// Get seller By Id For Admin
router.get(
  '/chat/sellers/get-admin-messages',
  authMiddleware,
  chatController.getAdminMessagesBySeller
)
//Seller Send message to Admin
router.post(
  '/chat/sellers/send-message-to-admin',
  authMiddleware,
  chatController.sellerSendMessageToAdmin
)

//// For Admin Routes Chat ////
// Get All Sellers by Admin
router.get('/chat/admins/get-sellers', authMiddleware, chatController.getSellersByAdmin)
// Get seller By Id For Admin
router.get(
  '/chat/admins/get-seller-messages/:sellerId',
  authMiddleware,
  chatController.getSellerMessagesByAdmin
)
//Seller Send message to Admin
router.post(
  '/chat/admins/send-message-to-seller',
  authMiddleware,
  chatController.adminSendMessageToSeller
)

module.exports = router
