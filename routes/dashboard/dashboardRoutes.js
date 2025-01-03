const dashboardController = require('../../controllers/dashboard/dashboardController')
const { authMiddleware } = require('../../middlewares/authMiddleware')

const router = require('express').Router()

//RESTful API
// For Admin Dashboard

// Admin get Data Dashboard
router.get('/admin/dashboard-data', authMiddleware, dashboardController.getAdminDashboardData)

// For Seller Dashboard
router.get('/seller/dashboard-data', authMiddleware, dashboardController.getSellerDashboardData)

module.exports = router
