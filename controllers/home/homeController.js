const formidable = require('formidable')
const { responseReturn } = require('../../utils/response')
const cloudinary = require('cloudinary').v2
const categoryModel = require('../../models/categoryModel')
const productModel = require('../../models/productModel')
const { cloudinaryConfig } = require('../../utils/cloudinaryConfig')
const queryProducts = require('../../utils/queryProducts')

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




}


module.exports = new homeController()