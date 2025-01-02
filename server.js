const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { dbConnect } = require('./utils/db')

//socket
const socket = require('socket.io')
const http = require('http')
const server = http.createServer(app)

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGINS.split(',') // Chuyển thành mảng
    if (allowedOrigins.includes(origin) || !origin) {
      // Nếu origin hợp lệ hoặc không có origin (ví dụ: Postman)
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions))

/// Danh sách lưu trữ khách hàng, người bán và quản trị viên đang kết nối
var allCustomers = []
var allSellers = []
let admin = {}

// Thêm khách hàng mới vào danh sách nếu chưa tồn tại
const addUser = (customerId, socketId, userInfo) => {
  const checkUser = allCustomers.some((u) => u.customerId === customerId)
  if (!checkUser) {
    allCustomers.push({ customerId, socketId, userInfo })
  }
}

// Thêm người bán mới vào danh sách nếu chưa tồn tại
const addSeller = (sellerId, socketId, userInfo) => {
  const checkSeller = allSellers.some((u) => u.sellerId === sellerId)
  if (!checkSeller) {
    allSellers.push({ sellerId, socketId, userInfo })
  }
}

// Tìm khách hàng dựa trên ID
const findCustomer = (customerId) => {
  return allCustomers.find((c) => c.customerId === customerId)
}

// Tìm seller dựa trên ID
const findSeller = (sellerId) => {
  return allSellers.find((c) => c.sellerId === sellerId)
}
// Xóa người dùng đã ngắt kết nối dựa trên socketId
const remove = (socketId) => {
  allCustomers = allCustomers.filter((c) => c.socketId !== socketId)
  allSellers = allSellers.filter((s) => s.socketId !== socketId)
}

// Kết nối socket server đến client
const io = socket(server, { cors: { origin: '*', credentials: true } })
io.on('connection', (soc) => {
  console.log('Socket server connected.')

  // Thêm khách hàng mới khi kết nối
  soc.on('add_user', (customerId, userInfo) => {
    addUser(customerId, soc.id, userInfo)
    io.emit('activeCustomer', allCustomers) // Gửi danh sách khách hàng đang hoạt động
  })

  // Thêm người bán mới khi kết nối
  soc.on('add_seller', (sellerId, userInfo) => {
    //console.log(sellerId, userInfo)
    addSeller(sellerId, soc.id, userInfo)
    io.emit('activeSeller', allSellers) // Gửi danh sách người bán đang hoạt động
  })

  // Thêm admin mới khi kết nối
  soc.on('add_admin', (adminInfo) => {
    delete adminInfo.email
    delete adminInfo.password
    admin = adminInfo
    admin.socketId = soc.id
    io.emit('activeSeller', allSellers)
  })

  // Người bán gửi tin nhắn đến khách hàng
  soc.on('seller_send_message_customer', (msg) => {
    const customer = findCustomer(msg.receiverId)
    if (customer) {
      io.to(customer.socketId).emit('seller_message_push_customer', msg)
    }
  })

  // Customer gửi tin nhắn đến Seller
  soc.on('customer_send_message_seller', (msg) => {
    //console.log(msg)
    const seller = findSeller(msg.receiverId)
    if (seller) {
      io.to(seller.socketId).emit('customer_send_message_seller', msg)
    }
  })

  // Admin gửi tin nhắn đến Seller
  soc.on('admin_send_message_seller', (msg) => {
    //console.log(msg)
    const seller = findSeller(msg.receiverId)
    if (seller) {
      io.to(seller.socketId).emit('admin_send_message_seller', msg)
    }
  })

  // Seller gửi tin nhắn đến Admin
  soc.on('seller_send_message_admin', (msg) => {
    if (admin.socketId) {
      io.to(admin.socketId).emit('seller_send_message_admin', msg)
    }
  })
  // Xử lý sự kiện ngắt kết nối của socket
  soc.on('disconnect', () => {
    remove(soc.id) // Xóa socket khỏi danh sách
    console.log('Client disconnected.')

    // Phát lại danh sách người bán và khách hàng đang hoạt động
    io.emit('activeSeller', allSellers)
    io.emit('activeCustomer', allCustomers)
  })
})

//bodyParser
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/', (req, res) => res.send('My Backend TH Shop'))

//Client
app.use('/api/home', require('./routes/home/homeRoutes'))
app.use('/api', require('./routes/home/customerAuthRoutes'))
app.use('/api', require('./routes/home/cartRoutes'))
app.use('/api', require('./routes/home/orderRoutes'))
app.use('/api', require('./routes/chatRoutes'))

//Dashboard
app.use('/api', require('./routes/authRoutes'))
app.use('/api', require('./routes/dashboard/categoryRoutes'))
app.use('/api', require('./routes/dashboard/productRoutes'))
app.use('/api', require('./routes/dashboard/sellerRoutes'))
app.use('/api', require('./routes/dashboard/orderRoutes'))
app.use('/api', require('./routes/paymentRoutes'))
app.use('/api', require('./routes/dashboard/dashboardRoutes'))

const port = process.env.PORT || 8080
dbConnect()
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
