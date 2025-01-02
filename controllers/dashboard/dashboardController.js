const { responseReturn } = require('../../utils/response')
const myShopWalletModel = require('../../models/myShopWalletModel')
const productModel = require('../../models/productModel')
const customerOrderModel = require('../../models/customerOrderModel')
const sellerModel = require('../../models/sellerModel')
const adminSellerMessageModel = require('../../models/chat/adminSellerMessageModel')

class dashboardController {
  //@desc  Fetch add category
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
      const totalOrder = await customerOrderModel.countDocuments() //Đếm tất cả tài liệu mà không bị ảnh hưởng bởi query hoặc middleware.
      const totalSeller = await sellerModel.find({}).countDocuments()
      const recentMessages = await adminSellerMessageModel.find({}).limit(3)
      const recentOrders = await customerOrderModel.find({}).limit(5)
      console.log(totalOrder)
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
}

module.exports = new dashboardController()
