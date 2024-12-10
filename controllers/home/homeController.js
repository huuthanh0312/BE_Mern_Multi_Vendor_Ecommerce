const moment = require('moment')
const { responseReturn } = require('../../utils/response')
const categoryModel = require('../../models/categoryModel')
const productModel = require('../../models/productModel')
const queryProducts = require('../../utils/queryProducts')
const reviewModel = require('../../models/reviewModel')
const { mongo: { ObjectId } } = require('mongoose')

class homeController {
  //formate product convert array [1,2,3], [4,5,6]
  formateProduct = (products) => {
    const productArray = []
    let i = 0
    while (i < products.length) {
      let temp = []
      let j = i
      while (j < i + 3) {
        if (products[j]) {
          temp.push(products[j])
        }
        j++
      }
      productArray.push([...temp])
      i = j
    }
    return productArray
  }


  //@desc  Fetch get category
  //@route get /api/home/categories
  //@access private
  getCategories = async (req, res) => {
    try {
      const categories = await categoryModel.find({})
      //console.log(categories)
      responseReturn(res, 200, { categories })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }

  }
  //end method

  //@desc  Fetch get product
  //@route get /api/home/products
  //@access private
  getProducts = async (req, res) => {
    try {
      const products = await productModel.find({}).limit(12).sort({ createdAt: -1 })

      const allLatestProducts = await productModel.find({}).limit(9).sort({ createdAt: -1 })
      const latestProducts = this.formateProduct(allLatestProducts)

      const allTopRatedProducts = await productModel.find({}).limit(9).sort({ rating: -1 })
      const topRatedProducts = this.formateProduct(allTopRatedProducts)

      const allDiscountProducts = await productModel.find({}).limit(9).sort({ discount: -1 })
      const discountProducts = this.formateProduct(allDiscountProducts)
      //console.log(products)
      responseReturn(res, 200, { products, latestProducts, topRatedProducts, discountProducts })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }

  }
  //end method

  //@desc  Fetch get product by price range
  //@route get /api/home/products/price-range
  //@access private
  priceRangeProduct = async (req, res) => {
    try {
      const priceRange = {
        low: 0, high: 0,
      }
      const products = await productModel.find({}).limit(12).sort({ createdAt: -1 })   // 1 for asc -1 if for Desc
      const latestProducts = this.formateProduct(products)

      const getForPrice = await productModel.find({}).sort({ 'price': 1 })
      if (getForPrice.length > 0) {
        priceRange.high = getForPrice[getForPrice.length - 1].price
        priceRange.low = getForPrice[0].price
      }
      //console.log(getForPrice)
      responseReturn(res, 200, { latestProducts, priceRange })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }

  }
  //end method


  //@desc  Fetch get product by query 
  //@route get /api/home/products/query
  //@access private
  queryProducts = async (req, res) => {
    const parPage = 12
    req.query.parPage = parPage
    try {
      const products = await productModel.find({}).sort({ createdAt: -1 })   // 1 for asc -1 if for Desc
      //console.log(req.query)
      const totalProduct = new queryProducts(products, req.query).categoryQuery().ratingQuery().priceQuery().searchQuery().sortByPrice().countProducts()
      const result = new queryProducts(products, req.query).categoryQuery().ratingQuery().priceQuery().searchQuery().sortByPrice().skip().limit().getProducts()
      responseReturn(res, 200, { products: result, totalProduct, parPage })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }

  }
  //end method


  //@desc  Fetch get product details by slug
  //@route get /api/home/products/details/:slug
  //@access private
  productDetails = async (req, res) => {
    const { slug } = req.params
    try {
      const product = await productModel.findOne({ slug })
      //console.log(product)
      if (product) {
        //List product, not product details
        const relatedProducts = await productModel.find({
          $and: [{
            _id: {
              $ne: product.id
            }
          }, {
            category: {
              $eq: product.category
            }
          }]
        }).limit(12)
        //List product, not product details
        const moreProducts = await productModel.find({
          $and: [{
            _id: {
              $ne: product.id
            }
          }, {
            sellerId: {
              $eq: product.sellerId
            }
          }]
        }).limit(8).sort({ createdAt: -1 })
        responseReturn(res, 200, { product, moreProducts, relatedProducts })
      } else {
        responseReturn(res, 404, { error: 'Can not find product!' })
      }


    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }

  }
  //end method

  //@desc  Fetch customer product details review
  //@route POST /api/home/customers/review
  //@access private
  customerReview = async (req, res) => {
    const { name, review, rating, productId } = req.body
    try {
      await reviewModel.create({
        productId, name, rating, review, date: moment(Date.now()).format('LL')
      })

      let rat = 0
      const reviews = await reviewModel.find({ productId })
      for (let i = 0; i < reviews.length; i++) {
        rat = rat + reviews[i].rating
      }

      let productRating = 0
      if (reviews.length > 0) {
        productRating = (rat / reviews.length).toFixed(1)
      }

      await productModel.findByIdAndUpdate(productId, { rating: productRating })
      responseReturn(res, 201, { message: 'Review Added Successfully' })

    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch customer product details review
  //@route GET /api/home/customers/reviews/:productid?pageNumber=
  //@access private
  getReviews = async (req, res) => {
    const { productId } = req.params
    let { pageNumber } = req.query
    //console.log(productId)
    //console.log(pageNumber)
    pageNumber = parseInt(pageNumber)
    const limit = 5
    const skipPage = limit * (pageNumber - 1)  // trang thoat
    try {
      const getRating = await reviewModel.aggregate([
        {
          $match: {
            productId: new ObjectId(productId), // Lọc theo productId
            rating: { $exists: true, $not: { $size: 0 } } // Lọc review có rating không rỗng
          }
        },
        {
          $unwind: "$rating" // Tách từng phần tử trong mảng rating
        },
        {
          $group: {
            _id: "$rating", // Nhóm theo từng giá trị rating
            count: { $sum: 1 } // Đếm số lượng mỗi giá trị
          }
        },
        {
          $sort: { _id: 1 } // Sắp xếp kết quả theo giá trị rating (tăng dần)
        }
      ])
      // count rating by review
      let ratingReview = [{ rating: 5, sum: 0 }, { rating: 4, sum: 0 }, { rating: 3, sum: 0 }, { rating: 2, sum: 0 }, { rating: 1, sum: 0 }]
      for (let i = 0; i < ratingReview.length; i++) {
        for (let j = 0; j < getRating.length; j++) {
          if (ratingReview[i].rating === getRating[j]._id) {
            ratingReview[i].sum = getRating[j].count
            break
          }
        }
      }

      const getAllReviews = await reviewModel.find({ productId })
      const reviews = await reviewModel.find({ productId }).skip(skipPage).limit(5).sort({ createdAt: -1 })

      //console.log(reviews, getAllReviews.length, ratingReview)
      responseReturn(res, 201, { reviews, totalReview: getAllReviews.length, ratingReview })


    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method
}


module.exports = new homeController()