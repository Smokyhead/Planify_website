const { db } = require("../config/database");
const Logger = require("../utils/logger");

class ExportService {
  /**
   * Export schedule data in various formats
   * @param {number} weekNumber 
   * @param {number} year 
   * @param {number} warehouseId 
   * @param {string} format 
   * @returns {Promise<object>}
   */
  static async exportSchedule(weekNumber, year, warehouseId = null, format = 'json') {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT
          s.code,
          s.name as store,
          c.contract_type as contract,
          ds.delivery_date,
          ds.delivery_day_of_week,
          ds.delay_days,
          w.location as warehouse,
          c.frequency_per_week as frequency
        FROM delivery_schedules ds
        JOIN stores s ON ds.store_id = s.id
        JOIN contracts c ON ds.contract_id = c.id
        JOIN warehouses w ON ds.warehouse_id = w.id
        WHERE ds.week_number = ? AND ds.year = ?
      `;

      const params = [weekNumber, year];

      if (warehouseId) {
        query += " AND ds.warehouse_id = ?";
        params.push(warehouseId);
      }

      query += " ORDER BY s.code, ds.delivery_date";

      db.query(query, params, (err, results) => {
        if (err) {
          Logger.error("Error fetching export data", err);
          reject(new Error("Failed to fetch export data"));
          return;
        }

        try {
          const exportData = this._transformToWeeklyFormat(results);
          
          if (format === 'csv') {
            const csvData = this._convertToCSV(exportData);
            resolve({
              format: 'csv',
              filename: `delivery_schedule_week_${weekNumber}_${year}.csv`,
              data: csvData,
              contentType: 'text/csv'
            });
          } else {
            resolve({
              format: 'json',
              week_number: weekNumber,
              year: year,
              warehouse_id: warehouseId,
              total_stores: exportData.length,
              schedule: exportData
            });
          }
        } catch (error) {
          Logger.error("Error transforming export data", error);
          reject(new Error("Failed to transform export data"));
        }
      });
    });
  }

  /**
   * Transform raw schedule data to weekly format
   * @private
   * @param {Array} results 
   * @returns {Array}
   */
  static _transformToWeeklyFormat(results) {
    const weeklySchedule = {};

    results.forEach(row => {
      const storeCode = row.code;
      if (!weeklySchedule[storeCode]) {
        weeklySchedule[storeCode] = {
          Code: row.code,
          Store: row.store,
          Contract: row.contract,
          Warehouse: row.warehouse,
          Frequency: 0,
          Monday: 0, DELAY_Monday: 0,
          Tuesday: 0, DELAY_Tuesday: 0,
          Wednesday: 0, DELAY_Wednesday: 0,
          Thursday: 0, DELAY_Thursday: 0,
          Friday: 0, DELAY_Friday: 0,
          Saturday: 0, DELAY_Saturday: 0,
          Sunday: 0, DELAY_Sunday: 0
        };
      }

      const dayName = row.delivery_day_of_week;
      weeklySchedule[storeCode][dayName] = 1;
      weeklySchedule[storeCode][`DELAY_${dayName}`] = row.delay_days;
      weeklySchedule[storeCode].Frequency++;
    });

    return Object.values(weeklySchedule);
  }

  /**
   * Convert data to CSV format
   * @private
   * @param {Array} exportData 
   * @returns {string}
   */
  static _convertToCSV(exportData) {
    const headers = [
      'Code', 'Store', 'Contract', 
      'Mon', 'DELAY_Mon', 
      'Tue', 'DELAY_Tue', 
      'Wed', 'DELAY_Wed', 
      'Thu', 'DELAY_Thu', 
      'Fri', 'DELAY_Fri', 
      'Sat', 'DELAY_Sat', 
      'Sun', 'DELAY_Sun', 
      'Warehouse', 'Frequency'
    ];
    
    let csv = headers.join(',') + '\n';

    exportData.forEach(row => {
      const csvRow = [
        row.Code, row.Store, row.Contract,
        row.Monday, row.DELAY_Monday,
        row.Tuesday, row.DELAY_Tuesday,
        row.Wednesday, row.DELAY_Wednesday,
        row.Thursday, row.DELAY_Thursday,
        row.Friday, row.DELAY_Friday,
        row.Saturday, row.DELAY_Saturday,
        row.Sunday, row.DELAY_Sunday,
        row.Warehouse, row.Frequency
      ].map(field => `"${field}"`).join(',');
      csv += csvRow + '\n';
    });

    return csv;
  }

  /**
   * Get schedule data for specific week
   * @param {number} week 
   * @param {number} year 
   * @param {number} warehouseId 
   * @returns {Promise<Array>}
   */
  static async getSchedules(week, year, warehouseId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT ds.*, s.code as store_code, s.name as store_name, c.contract_type, w.location as warehouse_location
        FROM delivery_schedules ds
        JOIN stores s ON ds.store_id = s.id
        JOIN contracts c ON ds.contract_id = c.id
        JOIN warehouses w ON ds.warehouse_id = w.id
        WHERE ds.week_number = ? AND ds.year = ?
      `;

      const params = [week, year];

      if (warehouseId) {
        query += " AND ds.warehouse_id = ?";
        params.push(warehouseId);
      }

      query += " ORDER BY ds.delivery_date, s.code";

      db.query(query, params, (err, results) => {
        if (err) {
          Logger.error("Error fetching schedules", err);
          reject(new Error("Failed to fetch schedules"));
          return;
        }
        resolve(results);
      });
    });
  }

  /**
   * Export optimization runs data
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  static async exportOptimizationRuns(limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM optimization_runs
        ORDER BY run_date DESC
        LIMIT ?
      `;

      db.query(query, [limit], (err, results) => {
        if (err) {
          Logger.error("Error fetching optimization runs", err);
          reject(new Error("Failed to fetch optimization runs"));
          return;
        }
        resolve(results);
      });
    });
  }
}

module.exports = ExportService;
