const { responseReturn } = require('../utils/response')
require('dotenv').config() // Đảm bảo đã cài dotenv: npm install dotenv
const stripeModel = require('../models/stripeModel')
const sellerModel = require('../models/sellerModel')
const withdrawRequestModel = require('../models/withdrawRequestModel')
const sellerWalletModel = require('../models/sellerWalletModel')
const { v4: uuidv4 } = require('uuid')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const {
  mongo: { ObjectId }
} = require('mongoose')

class paymentController {
  //For Seller Request

  //@desc  Fetch create payment account seller
  //@route GET /api/payment/create-stripe-connect-account
  //@access private
  createSellerStripeConnectAcount = async (req, res) => {
    const { id } = req
    const uid = uuidv4()
    try {
      const stripeInfo = await stripeModel.findOne({ sellerId: id })
      if (stripeInfo) {
        await stripeModel.deleteOne({ sellerId: id })
        const account = await stripe.accounts.create({ type: 'express' })

        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.DASHBOARD_URL}/refresh`,
          return_url: `${process.env.DASHBOARD_URL}/success?activeCode=${uid}`,
          type: 'account_onboarding' // Gõ đúng tên loại
        })
        await stripeModel.create({
          sellerId: id,
          stripeId: account.id,
          code: uid
        })
        responseReturn(res, 201, { url: accountLink.url })
      } else {
        const account = await stripe.accounts.create({ type: 'express' })

        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.DASHBOARD_URL}/refresh`,
          return_url: `${process.env.DASHBOARD_URL}/success?activeCode=${uid}`,
          type: 'account_onboarding'
        })
        await stripeModel.create({
          sellerId: id,
          stripeId: account.id,
          code: uid
        })
        responseReturn(res, 201, { url: accountLink.url })
      }
    } catch (error) {
      console.log('Stripe connect account error ' + error.message)
    }
  }
  //end method

  //@desc  Fetch active payment account seller
  //@route PUT /api/payment/active-stripe-connect-account
  //@access private
  activeSellerStripeConnectAcount = async (req, res) => {
    const { activeCode } = req.params
    const { id } = req
    try {
      const userStripeInfo = await stripeModel.findOne({ code: activeCode })
      if (userStripeInfo) {
        await sellerModel.findByIdAndUpdate(id, { payment: 'active' })
        responseReturn(res, 200, { message: 'Payment Active Successfully' })
      } else {
        responseReturn(res, 404, { message: 'Payment Active Faild' })
      }
    } catch (error) {
      responseReturn(res, 500, { message: 'Internal Server Error' })
    }
  }
  //end method

  // Function  sum amount
  sumAmount = (data) => {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i].amount
    }
    return sum
  }
  //@desc  Fetch payment seller request
  //@route GET /api/payment/seller/details/:sellerId
  //@access private
  getSellerPaymentDetails = async (req, res) => {
    const { sellerId } = req.params
    try {
      const payments = await sellerWalletModel.find({ sellerId })

      const pendingWithdraws = await withdrawRequestModel.find({
        $and: [{ sellerId: { $eq: sellerId } }, { status: { $eq: 'pending' } }]
      })
      const successWithdraws = await withdrawRequestModel.find({
        $and: [{ sellerId: { $eq: sellerId } }, { status: { $eq: 'success' } }]
      })
      const totalAmount = this.sumAmount(payments)
      const pendingAmount = this.sumAmount(pendingWithdraws)
      const withdrawAmount = this.sumAmount(successWithdraws)

      let availableAmount = 0
      if (totalAmount > 0) {
        availableAmount = totalAmount - pendingAmount
      }
      responseReturn(res, 200, {
        pendingWithdraws,
        successWithdraws,
        totalAmount,
        pendingAmount,
        withdrawAmount,
        availableAmount
      })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch payment seller request
  //@route POST /api//payment/seller/withdraw-request
  //@access private
  sendWithdrawRequestForSeller = async (req, res) => {
    const { amount, sellerId } = req.body.info
    //console.log(amount, sellerId)
    try {
      const withdraw = await withdrawRequestModel.create({ sellerId, amount: parseInt(amount) })
      responseReturn(res, 200, { withdraw, message: 'Withdraw Request Send Successfully' })
    } catch (error) {
      responseReturn(res, 500, { message: 'Internal Server Error' })
    }
  }
  //end method

  // For Admin Request
  //@desc  Fetch payment seller request
  //@route GET /api/payment/seller/details/:sellerId
  //@access private
  getAdminPaymentRequests = async (req, res) => {
    try {
      const withdrawRequests = await withdrawRequestModel.find({ status: 'pending' })

      responseReturn(res, 200, { withdrawRequests })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch Admin confirm payment request
  //@route POST /api/payment/admin/confitm-request
  //@access private
  adminConfirmRequestPayment = async (req, res) => {
    const { paymentId } = req.body
    try {
      const payment = await withdrawRequestModel.findById(paymentId)
      const { stripeId } = await stripeModel.findOne({ sellerId: new ObjectId(payment.sellerId) })
      await stripe.transfers.create({
        amount: payment.amount * 100,
        currency: 'usd',
        destination: stripeId
      })
      await withdrawRequestModel.findByIdAndUpdate(paymentId, { status: 'success' })
      responseReturn(res, 200, { payment, message: 'Request Confirm Successfully' })
    } catch (error) {
      //console.log(error.message)
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method
}
module.exports = new paymentController()
