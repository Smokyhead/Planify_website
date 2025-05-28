const DashboardService = require("../services/dashboardService");
const Logger = require("../utils/logger");
const { createApiResponse } = require("../utils/helpers");

class DashboardController {
  /**
   * Get dashboard statistics
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getDashboardStats(req, res) {
    try {
      const stats = await DashboardService.getDashboardStats();
      
      Logger.info("Dashboard stats retrieved", { 
        userId: req.user?.id,
        deliveries: stats.currentMonth.deliveries,
        stores: stats.currentMonth.stores
      });

      res.json(createApiResponse(true, stats));
    } catch (error) {
      Logger.error("Get dashboard stats controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch dashboard statistics"));
    }
  }

  /**
   * Get warehouse performance metrics
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getWarehouseMetrics(req, res) {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      
      if (isNaN(warehouseId)) {
        return res.status(400).json(createApiResponse(false, null, null, "Invalid warehouse ID"));
      }

      const metrics = await DashboardService.getWarehouseMetrics(warehouseId);
      
      res.json(createApiResponse(true, metrics));
    } catch (error) {
      Logger.error("Get warehouse metrics controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch warehouse metrics"));
    }
  }

  /**
   * Get delivery trends
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getDeliveryTrends(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      
      if (days < 1 || days > 365) {
        return res.status(400).json(createApiResponse(false, null, null, "Days must be between 1 and 365"));
      }

      const trends = await DashboardService.getDeliveryTrends(days);
      
      res.json(createApiResponse(true, {
        period_days: days,
        trends: trends
      }));
    } catch (error) {
      Logger.error("Get delivery trends controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch delivery trends"));
    }
  }

  /**
   * Get system health status
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getSystemHealth(req, res) {
    try {
      const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        version: process.version,
        environment: process.env.NODE_ENV || "development"
      };

      res.json(createApiResponse(true, health));
    } catch (error) {
      Logger.error("Get system health controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to get system health"));
    }
  }
}

module.exports = DashboardController;
