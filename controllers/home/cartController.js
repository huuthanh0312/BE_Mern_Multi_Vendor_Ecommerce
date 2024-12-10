const formidable = require('formidable')
const { responseReturn } = require('../../utils/response')
const cloudinary = require('cloudinary').v2
const { cloudinaryConfig } = require('../../utils/cloudinaryConfig')
const cartModel = require('../../models/cartModel')
const { mongo: { ObjectId } } = require('mongoose')
const wishlistModel = require('../../models/wishlistModel')

class cartController {
  //@desc  Fetch to cart add product
  //@route POST /api/home/cart/add
  //@access private
  addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body
    //console.log(req.body)
    try {
      const product = await cartModel.findOne({
        $and: [
          {
            productId: { $eq: productId }
          },
          {
            userId: { $eq: userId }
          },
          {
            quantity: { $eq: quantity }
          }
        ]
      })
      if (product) {
        responseReturn(res, 404, { error: 'Product Already Add To Cart' })
      } else {
        const product = await cartModel.create({ userId, productId, quantity })
        responseReturn(res, 201, { product, message: 'Product Added To Cart Successfully' })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch to get cart prodduct
  //@route POST /api/home/cart/get-products
  //@access private
  getCartProducts = async (req, res) => {
    const { userId } = req.params

    // Tỷ lệ hoa hồng mặc định khi sản phẩm được bán bởi nhà cung cấp khác
    const commission = 5

    //console.log(userId)
    if (!ObjectId.isValid(userId)) {
      console.error('Invalid userId:', userId)
      return res.status(400).json({ message: 'Invalid userId' })
    }
    try {
      const cartProducts = await cartModel.aggregate([{
        $match: {
          userId: {
            $eq: new ObjectId(userId)
          }
        }
      },
      {
        $unwind: "$productId" // Dùng $unwind nếu productId là mảng
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: "_id",
          as: 'products'
        }
      }
      ])
      //console.log(cartProducts)

      let buy_product_item = 0 //items product by cart
      let calculatePrice = 0 // items price
      let cart_product_count = 0 // count of products

      // check count product is out of stock
      //const outOfStockProducts = cartProducts.filter((p) => p.products[0].stock < p.quantity) // out of stock product
      // Filter out-of-stock products
      const outOfStockProducts = cartProducts
        .filter((p) => p.products[0]?.stock < p.quantity)
        .map((p) => ({
          _id: p._id,
          quantity: p.quantity,
          productInfo: p.products[0] // Ensure detailed product info is included
        }))
      // console.log(outOfStockProducts)
      for (let i = 0; i < outOfStockProducts.length; i++) {
        cart_product_count += outOfStockProducts[i].quantity
      }
      //console.log(cart_product_count)

      // check count product is stock
      const stockProduct = cartProducts.filter((p) => p.products[0]?.stock >= p.quantity)

      for (let i = 0; i < stockProduct.length; i++) {
        const { quantity } = stockProduct[i]
        cart_product_count = buy_product_item + quantity
        buy_product_item = buy_product_item + quantity
        // sum price check discount
        const { price, discount } = stockProduct[i].products[0]
        if (discount !== 0) {
          calculatePrice =
            calculatePrice + quantity * (price - Math.floor((price * discount) / 100))
        } else {
          calculatePrice = calculatePrice + quantity * price
        }
      }
      //console.log(buy_product_item)
      // Tính toán danh sách sản phẩm theo từng seller
      let sellerProducts = [] // Mảng chứa thông tin seller và sản phẩm của họ

      // Lấy danh sách sellerId duy nhất
      let uniqueSellerIds = [...new Set(stockProduct.map((p) => p.products[0].sellerId.toString()))]

      // Duyệt qua từng sellerId để gom sản phẩm
      uniqueSellerIds.forEach((sellerId) => {
        // Lọc sản phẩm theo sellerId hiện tại
        let productsBySeller = stockProduct.filter(
          (item) => item.products[0].sellerId.toString() === sellerId
        )

        // Tính tổng giá và gom sản phẩm
        let totalPrice = 0
        let products = productsBySeller.map((item) => {
          const product = item.products[0]
          let price =
            product.discount !== 0
              ? product.price - Math.floor((product.price * product.discount) / 100)
              : product.price

          // Áp dụng hoa hồng
          price = price - Math.floor((price * commission) / 100)

          // Tính tổng giá trị
          totalPrice += price * item.quantity

          // Trả về thông tin sản phẩm
          return {
            _id: item._id,
            quantity: item.quantity,
            productInfo: product
          }
        })

        // Thêm thông tin vào danh sách
        sellerProducts.push({
          sellerId,
          shopName: productsBySeller[0].products[0].shopName,
          price: totalPrice,
          products
        })
      })

      // shipping fee
      const shipping_fee = 10 * sellerProducts.length
      //console.log(sellerProducts)
      responseReturn(res, 200, {
        cartProducts: sellerProducts,
        price: calculatePrice,
        cart_product_count,
        shipping_fee,
        outOfStockProducts,
        buy_product_item
      })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch to cart delete product
  //@route Delete /api/home/cart/delete-product
  //@access private
  deleteCartProduct = async (req, res) => {
    const { cartId } = req.params
    //console.log(req.body)
    try {
      await cartModel.findByIdAndDelete(cartId)
      responseReturn(res, 200, { message: 'Product Remove Successfully' })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch  Cart Product Quantity Increase
  //@route PUT /api/home/cart/quantity-increase
  //@access private
  quantityIncrease = async (req, res) => {
    const { cartId } = req.params
    //console.log(cartId)
    try {
      const product = await cartModel.findById(cartId)
      if (!product) {
        // Return a 404 error if the product does not exist
        return responseReturn(res, 404, { message: 'Product not found' })
      }
      await cartModel.findByIdAndUpdate(cartId, { quantity: product.quantity + 1 })
      responseReturn(res, 200, { message: 'Quantity Updated Successfully' })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch  Cart Product Quantity Decrease
  //@route PUT /api/home/cart/quantity-decrease
  //@access private
  quantityDecrease = async (req, res) => {
    const { cartId } = req.params
    //console.log(cartId)
    try {
      const product = await cartModel.findById(cartId)
      if (!product) {
        // Return a 404 error if the product does not exist
        return responseReturn(res, 404, { message: 'Product not found' })
      }
      await cartModel.findByIdAndUpdate(cartId, { quantity: product.quantity - 1 })
      responseReturn(res, 200, { message: 'Quantity Updated Successfully' })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch to wishlist add product
  //@route POST /api/home/products/wishlist
  //@access private
  addToWishlist = async (req, res) => {
    const { userId, productId, name, price, discount, rating, slug, image } = req.body

    try {
      const product = await wishlistModel.findOne({ slug })
      if (product) {
        responseReturn(res, 404, { error: 'Product Already Add To Wishlist' })
      } else {
        const product = await wishlistModel.create(req.body)
        responseReturn(res, 201, { product, message: 'Product Added To Wishlist Successfully' })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch to wishlist get product
  //@route GET /api/home/product/wishlist/:userId
  //@access private
  getWishlistProducts = async (req, res) => {
    const { userId } = req.params
    try {
      const wishlists = await wishlistModel.find({ userId })
      responseReturn(res, 200, { wishlists, wishlist_count: wishlists.length })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch to wishlist remove
  //@route DELETE /api/home/product/wishlist/:wishlistId
  //@access private
  removeWishlistProduct = async (req, res) => {
    const { wishlistId } = req.params
    try {
      await wishlistModel.findByIdAndDelete(wishlistId)
      responseReturn(res, 200, { wishlistId, message: ' Wishlist Product Remove Successfully' })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method
}
module.exports = new cartController()
