const { responseReturn } = require('../../utils/response')
const myShopWalletModel = require('../../models/myShopWalletModel')
const sellerWalletModel = require('../../models/sellerWalletModel')
const productModel = require('../../models/productModel')
const customerOrderModel = require('../../models/customerOrderModel')
const sellerModel = require('../../models/sellerModel')
const adminSellerMessageModel = require('../../models/chat/adminSellerMessageModel')
const sellerCustomerMessageModel = require('../../models/chat/sellerCustomerMessageModel')
const authOrderModel = require('../../models/authOrderModel')
const {
  mongo: { ObjectId }
} = require('mongoose')

class dashboardController {
  //For Admin Dashboard

  //@desc Fetch Admin get data dashboard
  //@route GET /api/admin/dashboard-data
  //@access private
  getAdminDashboardData = async (req, res) => {
    const { id } = req

    try {
      const totalSale = await myShopWalletModel.aggregate([
        {
          $group: { _id: null, totalAmount: { $sum: '$amount' } }
        }
      ])

      const totalProduct = await productModel.find({}).countDocuments()
      const totalOrder = await customerOrderModel.find({}).countDocuments()
      const totalSeller = await sellerModel.find({}).countDocuments()
      const recentMessages = await adminSellerMessageModel.find({}).limit(5).sort({ createdAt: -1 })
      const recentOrders = await customerOrderModel.find({}).limit(5).sort({ createdAt: -1 })

      responseReturn(res, 200, {
        totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
        totalProduct,
        totalOrder,
        totalSeller,
        recentMessages,
        recentOrders
      })
    } catch (error) {
      responseReturn(res, 500, { error: 'Internal Server Error' })
    }
  }
  //end method

  //For Seller Dashboard

  //@desc Fetch seller get data dashboard
  //@route GET /api/admin/dashboard-data
  //@access private
  getSellerDashboardData = async (req, res) => {
    const { id } = req

    try {
      const totalSale = await sellerWalletModel.aggregate([
        {
          $match: { sellerId: { $eq: id } }
        },
        {
          $group: { _id: null, totalAmount: { $sum: '$amount' } }
        }
      ])
      const totalProduct = await productModel.find({ sellerId: new ObjectId(id) }).countDocuments()
      const totalOrder = await authOrderModel.find({ sellerId: new ObjectId(id) }).countDocuments()
      const totalPendingOrder = await authOrderModel
        .find({
          $and: [{ sellerId: { $eq: new ObjectId(id) } }, { delivery_status: { $eq: 'pending' } }]
        })
        .countDocuments()
      const recentMessages = await sellerCustomerMessageModel
        .find({ $or: [{ senderId: { $eq: id } }, { receiverId: { $eq: id } }] })
        .limit(5)
        .sort({ createdAt: -1 })
      const recentOrders = await authOrderModel
        .find({ sellerId: new ObjectId(id) })
        .limit(5)
        .sort({ createdAt: -1 })

      responseReturn(res, 200, {
        totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
        totalProduct,
        totalOrder,
        totalPendingOrder,
        recentMessages,
        recentOrders
      })
    } catch (error) {
      responseReturn(res, 500, { error: 'Internal Server Error' })
    }
  }
  //end method
}

module.exports = new dashboardController()
