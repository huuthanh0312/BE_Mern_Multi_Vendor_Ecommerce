const formidable = require('formidable')
const { responseReturn } = require('../../utils/response')
const cloudinary = require('cloudinary').v2
const { cloudinaryConfig } = require('../../utils/cloudinaryConfig');
const productModel = require('../../models/productModel');


class productController {

  //@desc  Fetch add product
  //@route POST /api/produts
  //@access private
  // addProduct = async (req, res) => {
  //   const { id } = req
  //   const form = formidable({ multiples: true })
  //   form.parse(req, async (error, fields, files) => {
  //     if (error) {
  //       responseReturn(res, 404, { error: 'Add Product Error' })
  //     } else {

  //       let { name, category, price, stock, discount, description, brand, shopName } = fields
  //       let { images } = files
  //       const slug = name.trim().toLowerCase().replace(/[/\s]+/g, '-').replace(/[^\w-]+/g, '')

  //       try {
  //         const allImageUrl = []
  //         if (!Array.isArray(images)) {
  //           images = [images];
  //         }
  //         //config cloudinary
  //         await cloudinaryConfig()
  //         for (let i = 0; i < images.length; i++) {
  //           const result = await cloudinary.uploader.upload(images[i].filepath, { folder: 'products' })
  //           allImageUrl.push(result.url)
  //         }

  //         await productModel.create({
  //           sellerId: id,
  //           name,
  //           slug,
  //           category: category.trim(),
  //           price: parseInt(price),
  //           stock: parseInt(stock),
  //           discount: parseInt(discount),
  //           description: description.trim(),
  //           brand: brand.trim(),
  //           shopName,
  //           images: allImageUrl,
  //         })
  //         responseReturn(res, 201, { message: "Product Add Successfully" })

  //       } catch (error) {
  //         responseReturn(res, 500, { error: error.message })
  //       }

  //     }
  //   })

  // }
  addProduct = async (req, res) => {
  const { id } = req;
  const form = formidable({ multiples: true });

  form.parse(req, async (error, fields, files) => {
    if (error) {
      return responseReturn(res, 400, { error: 'Form parsing error' });
    }

    const { name, category, price, stock, discount, description, brand, shopName } = fields;
    let { images } = files;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !category || !price || !stock || !description || !brand || !shopName || !images) {
      return responseReturn(res, 400, { error: 'All fields are required' });
    }

    const slug = name.trim().toLowerCase()
      .replace(/[\s/]+/g, '-') // Thay thế khoảng trắng hoặc dấu `/` bằng dấu `-`
      .replace(/[^\w-]+/g, ''); // Loại bỏ ký tự đặc biệt

    try {
      const allImageUrl = [];
      if (!Array.isArray(images)) {
        images = [images]; // Chuyển thành mảng nếu chỉ có 1 ảnh
      }

      // Config Cloudinary
      await cloudinaryConfig();

      // Upload đồng thời tất cả ảnh
      const uploadPromises = images.map((image) =>
        cloudinary.uploader.upload(image.filepath, { folder: 'products' })
      );
      const uploadResults = await Promise.all(uploadPromises);

      // Lưu URL vào danh sách
      uploadResults.forEach((result) => allImageUrl.push(result.url));

      // Thêm sản phẩm vào cơ sở dữ liệu
      await productModel.create({
        sellerId: id,
        name: name.trim(),
        slug,
        category: category.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        discount: parseInt(discount) || 0,
        description: description.trim(),
        brand: brand.trim(),
        shopName: shopName.trim(),
        images: allImageUrl,
      });

      responseReturn(res, 201, { message: "Product added successfully" });
    } catch (error) {
      // Xử lý lỗi khi thêm sản phẩm
      console.error('Add product error:', error);
      responseReturn(res, 500, { error: 'Server error: ' + error.message });
    }
  });
};

  //end method

  //@desc  Fetch get products
  //@route get /api/products
  //@access private
  getProducts = async (req, res) => {
    const { page, parPage, searchValue } = req.query

    try {
      let skipPage = ''
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1)
      }
      if (searchValue && page && parPage) {
        const products = await productModel.find({ name: { $regex: `${searchValue}`, $options: 'i' } }).skip(skipPage).limit(parPage).sort({ createdAt: - 1 })
        const totalProduct = await productModel.find({ name: { $regex: `${searchValue}`, $options: 'i' } }).countDocuments
        responseReturn(res, 200, { products, totalProduct })

      } else if (searchValue == '' && page && parPage) {
        const products = await productModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: - 1 })
        const totalProduct = await productModel.find({}).countDocuments()
        responseReturn(res, 200, { products, totalProduct })

      } else {
        const products = await productModel.find({}).sort({ createdAt: - 1 })
        const totalProduct = await productModel.find({}).countDocuments()
        responseReturn(res, 200, { products, totalProduct })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch get product by id
  //@route get /api/products/id
  //@access private
  getProduct = async (req, res) => {
    const { productId } = req.params

    try {
      const product = await productModel.findById(productId)
      //console.log(product)
      responseReturn(res, 200, { product })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
    //end method
  }

  //@desc  Fetch add product
  //@route PUT /api/produts
  //@access private
  updateProduct = async (req, res) => {
    const { productId } = req.params
    let { name, category, price, stock, discount, description, brand } = req.body
    const slug = name.trim().toLowerCase().replace(/[/\s]+/g, '-').replace(/[^\w-]+/g, '')
    try {
      await productModel.findByIdAndUpdate(productId, { name, category, price, stock, discount, description, brand, slug })
      const product = await productModel.findById(productId)
      responseReturn(res, 200, { product, message: 'Product Updated Successfully' })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }

  }
  //end method


  //@desc  Fetch update product image by Id
  //@route PUT /api/product/:productId/image
  //@access private
  updateProductImage = async (req, res) => {
    const { productId } = req.params

    try {
      // Đảm bảo parse form bằng async/await
      const { fields, files } = await new Promise((resolve, reject) => {
        const form = formidable({ multiples: true })
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          else resolve({ fields, files })
        })
      })

      const { oldImage } = fields
      const { newImage } = files

      // Cấu hình cloudinary và upload ảnh mới
      await cloudinaryConfig()
      const result = await cloudinary.uploader.upload(newImage.filepath, { folder: 'products' })

      if (!result) {
        return responseReturn(res, 404, { error: 'Image upload failed' })
      }

      // Tìm sản phẩm và cập nhật ảnh trong cơ sở dữ liệu
      const product = await productModel.findById(productId)
      if (!product) {
        return responseReturn(res, 404, { error: 'Product Not Found' })
      }

      const imageIndex = product.images.findIndex(img => img === oldImage)
      if (imageIndex !== -1) {
        product.images[imageIndex] = result.url
      } else {
        return responseReturn(res, 404, { error: 'Old Image Not Found' })
      }

      await product.save()
      responseReturn(res, 200, { product, message: 'Image Updated Successfully' })

    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }

}
module.exports = new productController()