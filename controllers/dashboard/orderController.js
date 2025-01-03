const { responseReturn } = require('../../utils/response')
const customerOrderModel = require('../../models/customerOrderModel')
const authOrderModel = require('../../models/authOrderModel')
const {
  mongo: { ObjectId }
} = require('mongoose')

class orderController {
  // For Admin Orders

  //@desc  Fetch get orders by admin
  //@route GET /api//admin/orders
  //@access private
  getAdminOrders = async (req, res) => {
    let { page, parPage, searchValue } = req.query
    parPage = parseInt(parPage)
    try {
      let skipPage = ''
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1)
      }
      if (searchValue && page && parPage) {
        const orders = await customerOrderModel
          .aggregate([
            {
              $lookup: {
                from: 'auth_orders',
                localField: '_id',
                foreignField: 'orderId',
                as: 'suborders'
              }
            }
          ])
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        const totalOrder = orders.length
        responseReturn(res, 200, { orders, totalOrder })
      } else if (searchValue == '' && page && parPage) {
        const orders = await customerOrderModel
          .aggregate([
            {
              $lookup: {
                from: 'auth_orders',
                localField: '_id',
                foreignField: 'orderId',
                as: 'suborders'
              }
            }
          ])
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        const totalOrder = orders.length
        //console.log(orders)
        responseReturn(res, 200, { orders, totalOrder })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch get orders by admin
  //@route GET /api//admin/orders/:orderId
  //@access private
  getAdminOrderById = async (req, res) => {
    const { orderId } = req.params
    try {
      const order = await customerOrderModel.aggregate([
        { $match: { _id: new ObjectId(orderId) } },
        {
          $lookup: {
            from: 'auth_orders',
            localField: '_id',
            foreignField: 'orderId',
            as: 'suborders'
          }
        }
      ])
      //console.log(order[0])
      responseReturn(res, 200, { order: order[0] })
    } catch (error) {
      console.log(`Get Admin Order Detail ${error.message}`)
    }
  }
  //end method

  //@desc  Fetch Admin update status orders
  //@route GET /api/admin/orders/status-update/:orderId
  //@access private
  updateAdminStatusOrder = async (req, res) => {
    const { orderId } = req.params
    const { status } = req.body
    //console.log(orderId, status)
    try {
      await customerOrderModel.findByIdAndUpdate(orderId, { delivery_status: status })
      responseReturn(res, 200, { message: `Order Update Stauts ${status} Successfully` })
    } catch (error) {
      responseReturn(res, 500, { error: `Internal Server Error` })
    }
  }

  // For Seller Orders
  //@desc  Fetch get orders by seller
  //@route GET /api/seller/orders/:sellerId
  //@access private
  getSellerOrders = async (req, res) => {
    const { sellerId } = req.params
    let { page, parPage, searchValue } = req.query
    parPage = parseInt(parPage)
    try {
      let skipPage = ''
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1)
      }
      if (searchValue && page && parPage) {
        const orders = await authOrderModel
          .find({ sellerId })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        const totalOrder = orders.length
        responseReturn(res, 200, { orders, totalOrder })
      } else if (searchValue == '' && page && parPage) {
        const orders = await authOrderModel
          .find({ sellerId })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        const totalOrder = orders.length
        //console.log(orders)
        responseReturn(res, 200, { orders, totalOrder })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch get orders by seller
  //@route GET /api/seller/orders/:orderId
  //@access private
  getSellerOrderById = async (req, res) => {
    const { orderId } = req.params
    try {
      const order = await authOrderModel.findById(orderId)
      //console.log(order)
      responseReturn(res, 200, { order })
    } catch (error) {
      console.log(`Get Seller Order Details ${error.message}`)
    }
  }
  //end method

  //@desc  Fetch Seller update status orders
  //@route GET /api/seller/orders/status-update/:orderId
  //@access private
  updateSellerStatusOrder = async (req, res) => {
    const { orderId } = req.params
    const { status } = req.body
    //console.log(orderId, status)
    try {
      await authOrderModel.findByIdAndUpdate(orderId, { delivery_status: status })
      responseReturn(res, 200, { message: `Order Update Stauts ${status} Successfully` })
    } catch (error) {
      responseReturn(res, 500, { error: `Internal Server Error` })
    }
  }
}
module.exports = new orderController()
