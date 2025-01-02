const { responseReturn } = require('../../utils/response')
const moment = require('moment')
const customerOrderModel = require('../../models/customerOrderModel')
const authOrderModel = require('../../models/authOrderModel')
const cartModel = require('../../models/cartModel')
const myShopWalletModel = require('../../models/myShopWalletModel')
const sellerWalletModel = require('../../models/sellerWalletModel')
const { ObjectId } = require('mongodb') // Import ObjectId từ thư viện mongodb
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

class orderController {
  // payment check
  paymentCheck = async (id) => {
    try {
      const order = await customerOrderModel.findById(id)
      if (order.payment_status === 'unpaid') {
        await customerOrderModel.findByIdAndUpdate(id, { delivery_status: 'cancelled' })
        await authOrderModel.updateMany({ orderId: id }, { delivery_status: 'cancelled' })
      }
      return true
    } catch (error) {
      console.log(error)
    }
  }
  //end methods

  //@desc  Fetch to place order
  //@route POST /api/home/order/place-order
  //@access private
  placeOrder = async (req, res) => {
    const { products, price, shipping_fee, items, shippingInfo, userId, navigate } = req.body
    //console.log(req.body)
    let authorOrderData = []
    let cartId = []
    const tempDate = moment(Date.now()).format('LLL') // ex: December 5, 2024 9:17 AM

    let orderProducts = []
    for (let i = 0; i < products.length; i++) {
      const productItems = products[i].products
      for (let j = 0; j < productItems.length; j++) {
        const tempProduct = productItems[j].productInfo // Tạo một bản sao
        tempProduct.quantity = productItems[j].quantity // thêm quantity vào object
        orderProducts.push(tempProduct)
        if (productItems[j]._id) {
          cartId.push(productItems[j]._id) // Thêm _id vào cartId nếu tồn tại
        }
      }
    }
    //console.log(orderProducts)
    //console.log(cartId)
    try {
      // add order product by customer
      const order = await customerOrderModel.create({
        customerId: userId,
        shippingInfo,
        products: orderProducts,
        price: price + shipping_fee,
        payment_status: 'unpaid',
        delivery_status: 'pending',
        date: tempDate
      })

      // add order for customer by auth
      for (let i = 0; i < products.length; i++) {
        const productItems = products[i].products
        const price = products[i].price
        const sellerId = products[i].sellerId
        let storePor = []
        for (let j = 0; j < productItems.length; j++) {
          const tempProduct = productItems[j].productInfo
          tempProduct.quantity = productItems[j].quantity
          storePor.push(tempProduct)
        }
        authorOrderData.push({
          orderId: order.id,
          sellerId,
          products: storePor,
          price: price,
          payment_status: 'unpaid',
          shippingInfo: 'TH Main Ware House',
          delivery_status: 'pending',
          date: tempDate
        })
      }

      // add auth model Order
      await authOrderModel.insertMany(authorOrderData)

      // delete cart when add order successfully
      for (let k = 0; k < cartId.length; k++) {
        await cartModel.findByIdAndDelete(cartId[k])
      }

      setTimeout(() => {
        this.paymentCheck(order.id)
      }, 15000) //15s

      responseReturn(res, 200, { messae: 'Order Placed Success', orderId: order.id })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch to Get Data Dahsboard Data Order
  //@route GET /api/home/customer/get-dashboard-data/:userId
  //@access private
  getDashBoardIndexData = async (req, res) => {
    const { userId } = req.params
    try {
      const recentOrders = await customerOrderModel
        .find({ customerId: new ObjectId(userId) })
        .limit(5)
      const totalOrder = await customerOrderModel
        .find({ customerId: new ObjectId(userId) })
        .countDocuments()
      const pendingOrder = await customerOrderModel
        .find({ customerId: new ObjectId(userId), delivery_status: 'pending' })
        .countDocuments()
      const cancelledOrder = await customerOrderModel
        .find({ customerId: new ObjectId(userId), delivery_status: 'cancelled' })
        .countDocuments()
      //console.log(recentOrders, totalOrder, pendingOrder, cancelledOrder, userId)

      responseReturn(res, 200, { recentOrders, totalOrder, pendingOrder, cancelledOrder })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch to get Orders By Status Customers Handle
  //@route GET /api//home/order/orders-by-status/:customerId/:status
  //@access private
  getOrdersByStatus = async (req, res) => {
    const { customerId, status } = req.params
    //console.log(customerId, status)
    try {
      let orders = []
      if (status !== 'all') {
        orders = await customerOrderModel.find({
          customerId: new ObjectId(customerId),
          delivery_status: status
        })
      } else {
        orders = await customerOrderModel.find({ customerId: new ObjectId(customerId) })
      }
      //console.log(orders)
      responseReturn(res, 200, { orders })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch to get Order Details Handle
  //@route GET /api//home/order/details/:orderId
  //@access private
  getOrderDetails = async (req, res) => {
    const { orderId } = req.params
    try {
      const orderDetails = await customerOrderModel.findById(orderId)

      //console.log(orders)
      responseReturn(res, 200, { orderDetails })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  // Payment

  //@desc  Fetch to get Order Details Handle
  //@route POST /api/order/create-payment
  //@access private
  createPayment = async (req, res) => {
    const { price } = req.body
    try {
      const payment = await stripe.paymentIntents.create({
        amount: price * 100,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true
        }
      })

      //console.log(payment)
      responseReturn(res, 200, { clientSecret: payment.client_secret })
    } catch (error) {
      console.log(error.massage)
    }
  }
  //end method

  //@desc  Fetch order payment confirm
  //@route GET /api/order/confirm/:orderId
  //@access private
  orderConfirmPayment = async (req, res) => {
    const { orderId } = req.params

    try {
      await customerOrderModel.findByIdAndUpdate(orderId, { payment_status: 'paid' })
      await authOrderModel.updateMany(
        { orderId: new ObjectId(orderId) },
        { payment_status: 'paid', delivery_status: 'pending' }
      )

      const customerOrder = await customerOrderModel.findById(orderId)
      console.log(customerOrder)
      const authOrder = await authOrderModel.find({ orderId: new ObjectId(orderId) })

      const time = moment(Date.now()).format('l')
      const splitTime = time.split('/')

      await myShopWalletModel.create({
        amount: customerOrder.price,
        month: splitTime[0],
        year: splitTime[2]
      })

      for (let i = 0; i < authOrder?.length; i++) {
        await sellerWalletModel.create({
          sellerId: authOrder[i]?.sellerId.toString(),
          amount: authOrder[i]?.price,
          month: splitTime[0],
          year: splitTime[2]
        })
      }
      responseReturn(res, 200, { message: `${orderId} Payment Successfully` })
    } catch (error) {
      console.log(error.message)
    }
  }
  //end method
}

module.exports = new orderController()
