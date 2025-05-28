const OptimizationService = require("../services/optimizationService");
const ExportService = require("../services/exportService");
const Logger = require("../utils/logger");
const { createApiResponse } = require("../utils/helpers");
const config = require("../config/app");

class OptimizationController {
  /**
   * Calculate distances between warehouse and stores
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async calculateDistances(req, res) {
    try {
      const { warehouse_id, store_ids } = req.body;

      if (!Array.isArray(store_ids)) {
        return res.status(400).json(createApiResponse(false, null, null, "store_ids must be an array"));
      }

      const result = await OptimizationService.calculateDistances(warehouse_id, store_ids);
      
      Logger.info("Distance calculation completed", { 
        warehouseId: warehouse_id, 
        storeCount: store_ids.length,
        userId: req.user?.id 
      });

      res.json(createApiResponse(true, result));
    } catch (error) {
      Logger.error("Calculate distances controller error", error);
      res.status(500).json(createApiResponse(false, null, null, error.message));
    }
  }

  /**
   * Generate optimized delivery schedule
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async generateSchedule(req, res) {
    try {
      const { 
        warehouse_id, 
        week_number, 
        year, 
        max_daily_distance = config.optimization.maxDailyDistance 
      } = req.body;

      // Validate week number
      if (week_number < 1 || week_number > 53) {
        return res.status(400).json(createApiResponse(false, null, null, "Week number must be between 1 and 53"));
      }

      // Validate year
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 1 || year > currentYear + 1) {
        return res.status(400).json(createApiResponse(false, null, null, "Year must be within reasonable range"));
      }

      // Validate max daily distance
      if (max_daily_distance <= 0 || max_daily_distance > 2000) {
        return res.status(400).json(createApiResponse(false, null, null, "Max daily distance must be between 1 and 2000 km"));
      }

      const result = await OptimizationService.generateSchedule(
        warehouse_id, 
        week_number, 
        year, 
        max_daily_distance
      );

      Logger.info("Schedule generation completed", { 
        warehouseId: warehouse_id, 
        weekNumber: week_number,
        year,
        totalDeliveries: result.summary.total_deliveries,
        executionTime: result.summary.execution_time_seconds,
        userId: req.user?.id 
      });

      res.json(createApiResponse(true, {
        optimization_run_id: result.optimization_run_id,
        schedule: result.schedule,
        summary: result.summary
      }, "Schedule generated successfully"));

    } catch (error) {
      Logger.error("Generate schedule controller error", error);
      res.status(500).json(createApiResponse(false, null, null, error.message));
    }
  }

  /**
   * Get optimization runs history
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getOptimizationRuns(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      
      if (limit > 100) {
        return res.status(400).json(createApiResponse(false, null, null, "Limit cannot exceed 100"));
      }

      const runs = await ExportService.exportOptimizationRuns(limit);
      res.json(createApiResponse(true, runs));
    } catch (error) {
      Logger.error("Get optimization runs controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch optimization runs"));
    }
  }

  /**
   * Get schedules for a specific week
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getSchedules(req, res) {
    try {
      const { week, year } = req.params;
      const { warehouse_id } = req.query;

      const weekNumber = parseInt(week);
      const yearNumber = parseInt(year);

      if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 53) {
        return res.status(400).json(createApiResponse(false, null, null, "Invalid week number"));
      }

      if (isNaN(yearNumber)) {
        return res.status(400).json(createApiResponse(false, null, null, "Invalid year"));
      }

      const warehouseIdNumber = warehouse_id ? parseInt(warehouse_id) : null;

      const schedules = await ExportService.getSchedules(weekNumber, yearNumber, warehouseIdNumber);
      
      res.json(createApiResponse(true, schedules));
    } catch (error) {
      Logger.error("Get schedules controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch schedules"));
    }
  }

  /**
   * Test endpoint for schedule functionality
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async testSchedule(req, res) {
    try {
      res.json(createApiResponse(true, {
        message: "Schedule endpoint is working!",
        timestamp: new Date().toISOString(),
        config: {
          maxDailyDistance: config.optimization.maxDailyDistance,
          defaultUnloadingTime: config.optimization.defaultUnloadingTime
        }
      }));
    } catch (error) {
      Logger.error("Test schedule controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Test endpoint failed"));
    }
  }
}

module.exports = OptimizationController;
