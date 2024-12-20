const { Schema, model } = require('mongoose')

const adminSellerMsgSchema = new Schema(
  {
    senderId: {
      type: String,
      default: ''
    },
    senderName: {
      type: String,
      required: true
    },
    // senderType: {
    //   type: String,
    //   enum: ['seller', 'customer', 'admin'],
    //   required: true
    // },
    receiverId: {
      type: String,
      default: ''
    },
    // receiverType: {
    //   type: String,
    //   enum: ['seller', 'customer', 'admin'],
    //   required: true
    // },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['unseen', 'seen'],
      default: 'unseen'
    }
  },
  { timestamps: true }
)

module.exports = model('admin_seller_messages', adminSellerMsgSchema)
