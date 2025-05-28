const ExportService = require("../services/exportService");
const Logger = require("../utils/logger");
const { createApiResponse } = require("../utils/helpers");

class ExportController {
  /**
   * Export schedule data
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async exportSchedule(req, res) {
    try {
      const { week_number, year, warehouse_id, format = 'json' } = req.body;

      // Validate week number
      if (!week_number || week_number < 1 || week_number > 53) {
        return res.status(400).json(createApiResponse(false, null, null, "Invalid week number"));
      }

      // Validate year
      if (!year || isNaN(year)) {
        return res.status(400).json(createApiResponse(false, null, null, "Invalid year"));
      }

      // Validate format
      if (!['json', 'csv'].includes(format)) {
        return res.status(400).json(createApiResponse(false, null, null, "Format must be 'json' or 'csv'"));
      }

      const result = await ExportService.exportSchedule(week_number, year, warehouse_id, format);

      Logger.info("Schedule export completed", { 
        weekNumber: week_number,
        year,
        warehouseId: warehouse_id,
        format,
        userId: req.user?.id 
      });

      if (format === 'csv') {
        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.data);
      } else {
        res.json(createApiResponse(true, result));
      }
    } catch (error) {
      Logger.error("Export schedule controller error", error);
      res.status(500).json(createApiResponse(false, null, null, error.message));
    }
  }

  /**
   * Export optimization runs data
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async exportOptimizationRuns(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const format = req.query.format || 'json';

      if (limit > 100) {
        return res.status(400).json(createApiResponse(false, null, null, "Limit cannot exceed 100"));
      }

      if (!['json', 'csv'].includes(format)) {
        return res.status(400).json(createApiResponse(false, null, null, "Format must be 'json' or 'csv'"));
      }

      const runs = await ExportService.exportOptimizationRuns(limit);

      Logger.info("Optimization runs export completed", { 
        limit,
        format,
        count: runs.length,
        userId: req.user?.id 
      });

      if (format === 'csv') {
        const csvData = this._convertOptimizationRunsToCSV(runs);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="optimization_runs.csv"');
        res.send(csvData);
      } else {
        res.json(createApiResponse(true, {
          total_runs: runs.length,
          runs: runs
        }));
      }
    } catch (error) {
      Logger.error("Export optimization runs controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to export optimization runs"));
    }
  }

  /**
   * Get available export formats
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getExportFormats(req, res) {
    try {
      const formats = {
        schedule: ['json', 'csv'],
        optimization_runs: ['json', 'csv'],
        dashboard_stats: ['json']
      };

      res.json(createApiResponse(true, {
        available_formats: formats,
        description: {
          json: "JavaScript Object Notation - structured data format",
          csv: "Comma Separated Values - spreadsheet compatible format"
        }
      }));
    } catch (error) {
      Logger.error("Get export formats controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to get export formats"));
    }
  }

  /**
   * Convert optimization runs to CSV format
   * @private
   * @param {Array} runs 
   * @returns {string}
   */
  static _convertOptimizationRunsToCSV(runs) {
    const headers = [
      'ID', 'Week Number', 'Year', 'Run Date', 'Total Distance (km)', 
      'Stores Served', 'Execution Time (s)', 'Status', 'Created By User ID'
    ];
    
    let csv = headers.join(',') + '\n';

    runs.forEach(run => {
      const csvRow = [
        run.id,
        run.week_number,
        run.year,
        run.run_date,
        run.total_distance_km,
        run.stores_served,
        run.execution_time_seconds,
        run.status,
        run.created_by_user_id
      ].map(field => `"${field || ''}"`).join(',');
      csv += csvRow + '\n';
    });

    return csv;
  }

  /**
   * Export dashboard statistics
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async exportDashboardStats(req, res) {
    try {
      const DashboardService = require("../services/dashboardService");
      const stats = await DashboardService.getDashboardStats();

      Logger.info("Dashboard stats export completed", { 
        userId: req.user?.id 
      });

      res.json(createApiResponse(true, {
        export_date: new Date().toISOString(),
        dashboard_statistics: stats
      }));
    } catch (error) {
      Logger.error("Export dashboard stats controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to export dashboard statistics"));
    }
  }
}

module.exports = ExportController;
