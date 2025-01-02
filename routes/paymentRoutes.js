const { authMiddleware } = require('../middlewares/authMiddleware')
const router = require('express').Router()
const paymentController = require('../controllers/paymentController')

//RESTful API
//For Seller Request
//create Seller stripe Connect Acount
router.get(
  '/payment/create-stripe-connect-account',
  authMiddleware,
  paymentController.createSellerStripeConnectAcount
)
//active Seller stripe Connect Acount
router.put(
  '/payment/active-stripe-connect-account/:activeCode',
  authMiddleware,
  paymentController.activeSellerStripeConnectAcount
)
// get request payment request by seller
router.get(
  '/payment/seller/details/:sellerId',
  authMiddleware,
  paymentController.getSellerPaymentDetails
)

// send withdraw request payment by seller
router.post(
  '/payment/seller/withdraw-request',
  authMiddleware,
  paymentController.sendWithdrawRequestForSeller
)

//For Admin Hanle Request
// Get Admin payment requests
router.get('/payment/admin/requests', authMiddleware, paymentController.getAdminPaymentRequests)
//Admin confirm payment request
router.post(
  '/payment/admin/confitm-request',
  authMiddleware,
  paymentController.adminConfirmRequestPayment
)
module.exports = router
