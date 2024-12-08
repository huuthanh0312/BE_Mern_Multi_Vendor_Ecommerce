const jwt = require('jsonwebtoken')

module.exports.customerAuthMiddleware = async (req, res, next) => {
  const { customerToken } = req.cookies; // Lấy token từ cookie
  if (!customerToken) {
    return res.status(401).json({ error: 'Customer not authenticated' }); // Trả lỗi nếu không có token
  }

  try {
    // Xác minh token
    const decodeToken = await jwt.verify(customerToken, process.env.SECRET);

    // Lưu thông tin từ token vào request để sử dụng trong các bước sau
    req.customerId = decodeToken.id

    // Tiếp tục xử lý middleware tiếp theo
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid customer token' }); // Báo lỗi nếu token không hợp lệ
  }
}
