const { Schema, model } = require("mongoose");

const sellerCustomerMsgSchema = new Schema({
  senderName: {
    type: String,
    required: true
  },
  senderId: {
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
    required: true
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
}, { timestamps: true });

module.exports = model('seller_customer_messages', sellerCustomerMsgSchema);
