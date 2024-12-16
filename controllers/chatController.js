const {
  mongo: { ObjectId }
} = require('mongoose')
const { responseReturn } = require('../utils/response')
const cartModel = require('../models/cartModel')
const sellerModel = require('../models/sellerModel')
const customerModel = require('../models/customerModel')
const sellerCustomerModel = require('../models/chat/sellerCustomerModel')
const sellerCustomerMessageModel = require('../models/chat/sellerCustomerMessageModel')

class chatController {
  //Controler Chat By Customers

  //@desc  Fetch add customer <=> seller by cusytomer
  //@route POST /api/home/chat/customers/add-friend
  //@access private
  addCustomerFriend = async (req, res) => {
    const { sellerId, userId } = req.body
    //console.log(sellerId)
    try {
      if (sellerId !== '') {
        const seller = await sellerModel.findById(sellerId)
        const user = await customerModel.findById(userId)

        // check User by customer for sellers <==> customer add friend
        const checkSeller = await sellerCustomerModel.findOne({
          $and: [
            {
              myId: {
                $eq: userId
              }
            },
            {
              myFriends: {
                $elemMatch: {
                  friendId: sellerId
                }
              }
            }
          ]
        })
        if (!checkSeller) {
          await sellerCustomerModel.updateOne(
            {
              myId: userId
            },
            {
              $push: {
                myFriends: {
                  friendId: sellerId,
                  name: seller.shopInfo?.shopName,
                  image: seller.image
                }
              }
            }
          )
        }

        // check User by seller for sellers <==> customer add friend
        const checkCustomer = await sellerCustomerModel.findOne({
          $and: [
            {
              myId: {
                $eq: sellerId
              }
            },
            {
              myFriends: {
                $elemMatch: {
                  friendId: userId
                }
              }
            }
          ]
        })
        if (!checkCustomer) {
          await sellerCustomerModel.updateOne(
            {
              myId: sellerId
            },
            {
              $push: {
                myFriends: {
                  friendId: userId,
                  name: user?.name,
                  image: user?.image || ''
                }
              }
            }
          )
        }

        // get messages seller <=> customer
        const messages = await sellerCustomerMessageModel.find({
          $or: [
            {
              $and: [
                {
                  receiverId: { $eq: sellerId }
                },
                {
                  senderId: {
                    $eq: userId
                  }
                }
              ]
            },
            {
              $and: [
                {
                  receiverId: { $eq: userId }
                },
                {
                  senderId: {
                    $eq: sellerId
                  }
                }
              ]
            }
          ]
        })
        const allMyFriends = await sellerCustomerModel.findOne({ myId: userId })
        const currentFriend = allMyFriends?.myFriends.find((s) => s.friendId === sellerId)
        responseReturn(res, 200, { myFriends: allMyFriends.myFriends, currentFriend, messages })
      } else {
        const allMyFriends = await sellerCustomerModel.findOne({ myId: userId })
        responseReturn(res, 200, { myFriends: allMyFriends.myFriends })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch add customer <=> seller for customer
  //@route POST /api/home/chat/customers/send-message-to-seller
  //@access private
  customerSendMessage = async (req, res) => {
    const { sellerId, name, userId, message } = req.body
    //console.log(sellerId)
    try {
      const messageSend = await sellerCustomerMessageModel.create({
        senderId: userId,
        senderName: name,
        receiverId: sellerId,
        message
      })

      // Customer chat với seller
      const dataByCustomer = await sellerCustomerModel.findOne({ myId: userId })
      //console.log(dataByCustomer)
      let myFriendsToCustomer = dataByCustomer?.myFriends

      // Tìm chỉ số của seller trong danh sách bạn bè của customer
      let i = myFriendsToCustomer.findIndex((f) => f.friendId === sellerId)

      // Nếu tìm thấy, di chuyển seller lên đầu danh sách
      if (i > 0) {
        const seller = myFriendsToCustomer.splice(i, 1)[0] // Lấy seller ra khỏi mảng
        myFriendsToCustomer.unshift(seller) // Thêm seller vào đầu mảng
      }
      // if (i > 0) {
      //   while (i > 0) {
      //     // Hoán đổi các phần tử trong mảng
      //     let temp = myFriendsToCustomer[i - 1];
      //     myFriendsToCustomer[j] = myFriendsToCustomer[i - 1];
      //     myFriendsToCustomer[i - 1] = temp;
      //     j--;
      //   }

      await sellerCustomerModel.updateOne({ myId: userId }, { myFriends: myFriendsToCustomer })

      // Seller chat với customer
      const dataBySeller = await sellerCustomerModel.findOne({ myId: sellerId })
      let myFriendsToSeller = dataBySeller?.myFriends

      // Tìm chỉ số của customer trong danh sách bạn bè của seller
      let j = myFriendsToSeller.findIndex((f) => f.friendId === userId)

      // Nếu tìm thấy, di chuyển customer lên đầu danh sách
      if (j > 0) {
        const customer = myFriendsToSeller.splice(j, 1)[0] // Lấy customer ra khỏi mảng
        myFriendsToSeller.unshift(customer) // Thêm customer vào đầu mảng
      }

      // Nếu tìm thấy và vị trí hợp lệ
      // if (j > 0) {
      //   while (j > 0) {
      //     // Hoán đổi các phần tử trong mảng
      //     let temp = myFriendsToSeller[j - 1];
      //     myFriendsToSeller[j] = myFriendsToSeller[j - 1];
      //     myFriendsToSeller[j - 1] = temp;
      //     j--;
      //   }
      await sellerCustomerModel.updateOne({ myId: sellerId }, { myFriends: myFriendsToSeller })

      responseReturn(res, 201, { messages: messageSend })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  // Controler Chat Sellers

  //@desc  Fetch add customer <=> seller by sellers
  //@route POST /api/home/chat/sellers/get-customer/:sellerId
  //@access private
  getCustomersBySeller = async (req, res) => {
    const { sellerId } = req.params
    //console.log(sellerId)
    try {
      if (sellerId !== '') {
        const data = await sellerCustomerModel.findOne({ myId: sellerId })
        //console.log(data)
        responseReturn(res, 200, { customers: data?.myFriends })
      } else {
        responseReturn(res, 404, { error: 'Seller By Id Not Found' })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch add customer <=> seller by cusytomer
  //@route POST /api/home/chat/customers/add-friend
  //@access private
  getCustomerMessagesBySeller = async (req, res) => {
    const { customerId } = req.params
    const { id } = req
    //console.log(id)
    try {
      // get messages seller <=> customer
      const seller_customer_messages = await sellerCustomerMessageModel.find({
        $or: [
          {
            $and: [
              {
                receiverId: { $eq: customerId }
              },
              {
                senderId: {
                  $eq: id
                }
              }
            ]
          },
          {
            $and: [
              {
                receiverId: { $eq: id }
              },
              {
                senderId: {
                  $eq: customerId
                }
              }
            ]
          }
        ]
      })

      const currentCustomer = await customerModel.findById(customerId)
      //console.log(seller_customer_messages)
      responseReturn(res, 200, { currentCustomer, seller_customer_messages })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch add customer <=> seller for customer
  //@route POST /api/home/chat/customers/send-message-to-seller
  //@access private
  sellerSendMessageToCustomer = async (req, res) => {
    const { senderId, name, receiverId, message } = req.body
    //console.log(sellerId)
    try {
      const messageSend = await sellerCustomerMessageModel.create({
        senderId: senderId,
        senderName: name,
        receiverId: receiverId,
        message
      })

      // Seller chat với customer
      const dataBySeller = await sellerCustomerModel.findOne({ myId: senderId })
      let myFriendsToSeller = dataBySeller?.myFriends

      // Tìm chỉ số của customer trong danh sách bạn bè của seller
      let j = myFriendsToSeller.findIndex((f) => f.friendId === senderId)

      // Nếu tìm thấy, di chuyển customer lên đầu danh sách
      if (j > 0) {
        const customer = myFriendsToSeller.splice(j, 1)[0] // Lấy customer ra khỏi mảng
        myFriendsToSeller.unshift(customer) // Thêm customer vào đầu mảng
      }

      // Nếu tìm thấy và vị trí hợp lệ
      // if (j > 0) {
      //   while (j > 0) {
      //     // Hoán đổi các phần tử trong mảng
      //     let temp = myFriendsToSeller[j - 1];
      //     myFriendsToSeller[j] = myFriendsToSeller[j - 1];
      //     myFriendsToSeller[j - 1] = temp;
      //     j--;
      //   }
      await sellerCustomerModel.updateOne({ myId: senderId }, { myFriends: myFriendsToSeller })

      // Customer chat với seller push to seller
      const dataByCustomer = await sellerCustomerModel.findOne({ myId: receiverId })
      //console.log(dataByCustomer)
      let myFriendsToCustomer = dataByCustomer?.myFriends

      // Tìm chỉ số của seller trong danh sách bạn bè của customer
      let i = myFriendsToCustomer.findIndex((f) => f.friendId === receiverId)

      // Nếu tìm thấy, di chuyển seller lên đầu danh sách
      if (i > 0) {
        const seller = myFriendsToCustomer.splice(i, 1)[0] // Lấy seller ra khỏi mảng
        myFriendsToCustomer.unshift(seller) // Thêm seller vào đầu mảng
      }
      // if (i > 0) {
      //   while (i > 0) {
      //     // Hoán đổi các phần tử trong mảng
      //     let temp = myFriendsToCustomer[i - 1];
      //     myFriendsToCustomer[j] = myFriendsToCustomer[i - 1];
      //     myFriendsToCustomer[i - 1] = temp;
      //     j--;
      //   }

      await sellerCustomerModel.updateOne({ myId: receiverId }, { myFriends: myFriendsToCustomer })

      responseReturn(res, 201, { messages: messageSend })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method
}
module.exports = new chatController()
