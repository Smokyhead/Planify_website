const { db } = require("../config/database");
const Logger = require("../utils/logger");

class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   * @returns {Promise<object>}
   */
  static async getDashboardStats() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const queries = {
      // Current month deliveries
      currentMonthDeliveries: {
        query: `
          SELECT COUNT(*) as count
          FROM delivery_schedules
          WHERE MONTH(delivery_date) = ? AND YEAR(delivery_date) = ?
        `,
        params: [currentMonth, currentYear]
      },

      // Last month deliveries for comparison
      lastMonthDeliveries: {
        query: `
          SELECT COUNT(*) as count
          FROM delivery_schedules
          WHERE MONTH(delivery_date) = ? AND YEAR(delivery_date) = ?
        `,
        params: [lastMonth, lastMonthYear]
      },

      // Total active stores
      totalStores: {
        query: `
          SELECT COUNT(*) as count
          FROM stores
          WHERE active_status = TRUE
        `,
        params: []
      },

      // Total active contracts
      totalContracts: {
        query: `
          SELECT COUNT(*) as count
          FROM contracts
          WHERE active_status = TRUE
        `,
        params: []
      },

      // Recent optimization runs
      recentOptimizations: {
        query: `
          SELECT COUNT(*) as count,
                 AVG(total_distance_km) as avg_distance,
                 AVG(execution_time_seconds) as avg_execution_time
          FROM optimization_runs
          WHERE run_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `,
        params: []
      },

      // Contract type distribution
      contractTypes: {
        query: `
          SELECT contract_type, COUNT(*) as count
          FROM contracts
          WHERE active_status = TRUE
          GROUP BY contract_type
        `,
        params: []
      },

      // Weekly delivery trends (last 4 weeks)
      weeklyTrends: {
        query: `
          SELECT
            WEEK(delivery_date) as week_number,
            COUNT(*) as deliveries,
            SUM(estimated_distance_km) as total_distance
          FROM delivery_schedules
          WHERE delivery_date >= DATE_SUB(NOW(), INTERVAL 4 WEEK)
          GROUP BY WEEK(delivery_date)
          ORDER BY week_number DESC
          LIMIT 4
        `,
        params: []
      }
    };

    try {
      const results = await this._executeQueries(queries);
      return this._processDashboardData(results);
    } catch (error) {
      Logger.error("Error getting dashboard stats", error);
      throw new Error("Failed to get dashboard statistics");
    }
  }

  /**
   * Execute multiple queries in parallel
   * @private
   * @param {object} queries 
   * @returns {Promise<object>}
   */
  static async _executeQueries(queries) {
    const results = {};
    const promises = [];

    Object.entries(queries).forEach(([key, queryConfig]) => {
      const promise = new Promise((resolve, reject) => {
        db.query(queryConfig.query, queryConfig.params, (err, queryResults) => {
          if (err) {
            Logger.error(`Error in ${key} query`, err);
            resolve(null);
          } else {
            resolve({ key, results: queryResults });
          }
        });
      });
      promises.push(promise);
    });

    const queryResults = await Promise.all(promises);
    
    queryResults.forEach(result => {
      if (result) {
        results[result.key] = result.results;
      }
    });

    return results;
  }

  /**
   * Process and format dashboard data
   * @private
   * @param {object} results 
   * @returns {object}
   */
  static _processDashboardData(results) {
    const currentDeliveries = results.currentMonthDeliveries?.[0]?.count || 0;
    const lastDeliveries = results.lastMonthDeliveries?.[0]?.count || 0;
    const deliveryGrowth = lastDeliveries > 0
      ? ((currentDeliveries - lastDeliveries) / lastDeliveries * 100).toFixed(1)
      : 0;

    const contractTypeCounts = {};
    if (results.contractTypes) {
      results.contractTypes.forEach(row => {
        contractTypeCounts[row.contract_type] = row.count;
      });
    }

    return {
      currentMonth: {
        deliveries: currentDeliveries,
        deliveryGrowth: parseFloat(deliveryGrowth),
        stores: results.totalStores?.[0]?.count || 0,
        contracts: results.totalContracts?.[0]?.count || 0
      },
      optimization: {
        recentRuns: results.recentOptimizations?.[0]?.count || 0,
        avgDistance: parseFloat(results.recentOptimizations?.[0]?.avg_distance || 0).toFixed(1),
        avgExecutionTime: parseFloat(results.recentOptimizations?.[0]?.avg_execution_time || 0).toFixed(3)
      },
      contracts: {
        comeau: contractTypeCounts.COMEAU || 0,
        comdet: contractTypeCounts.COMDET || 0,
        total: results.totalContracts?.[0]?.count || 0
      },
      trends: {
        weekly: results.weeklyTrends || []
      }
    };
  }

  /**
   * Get warehouse performance metrics
   * @param {number} warehouseId 
   * @returns {Promise<object>}
   */
  static async getWarehouseMetrics(warehouseId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          w.location as warehouse_name,
          COUNT(ds.id) as total_deliveries,
          AVG(ds.estimated_distance_km) as avg_distance,
          SUM(ds.estimated_distance_km) as total_distance,
          COUNT(DISTINCT ds.store_id) as unique_stores
        FROM warehouses w
        LEFT JOIN delivery_schedules ds ON w.id = ds.warehouse_id
        WHERE w.id = ? AND ds.delivery_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY w.id, w.location
      `;

      db.query(query, [warehouseId], (err, results) => {
        if (err) {
          Logger.error("Error fetching warehouse metrics", err);
          reject(new Error("Failed to fetch warehouse metrics"));
          return;
        }

        if (results.length === 0) {
          resolve({
            warehouse_name: "Unknown",
            total_deliveries: 0,
            avg_distance: 0,
            total_distance: 0,
            unique_stores: 0
          });
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  /**
   * Get delivery trends for a specific period
   * @param {number} days 
   * @returns {Promise<Array>}
   */
  static async getDeliveryTrends(days = 30) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          DATE(delivery_date) as date,
          COUNT(*) as deliveries,
          SUM(estimated_distance_km) as total_distance,
          COUNT(DISTINCT store_id) as unique_stores
        FROM delivery_schedules
        WHERE delivery_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(delivery_date)
        ORDER BY date DESC
      `;

      db.query(query, [days], (err, results) => {
        if (err) {
          Logger.error("Error fetching delivery trends", err);
          reject(new Error("Failed to fetch delivery trends"));
          return;
        }
        resolve(results);
      });
    });
  }
}

module.exports = DashboardService;
