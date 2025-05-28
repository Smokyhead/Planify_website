const { db } = require("../config/database");
const { calculateDistance, getWeekDates, getDayNames, roundToDecimals } = require("../utils/helpers");
const Logger = require("../utils/logger");

class OptimizationService {
  /**
   * Calculate distances between warehouse and stores
   * @param {number} warehouseId 
   * @param {number[]} storeIds 
   * @returns {Promise<object>}
   */
  static async calculateDistances(warehouseId, storeIds) {
    return new Promise((resolve, reject) => {
      // Get warehouse coordinates
      const warehouseQuery = "SELECT * FROM warehouses WHERE id = ?";
      
      db.query(warehouseQuery, [warehouseId], (err, warehouseResults) => {
        if (err || warehouseResults.length === 0) {
          Logger.error("Error fetching warehouse", err);
          reject(new Error("Failed to fetch warehouse"));
          return;
        }

        const warehouse = warehouseResults[0];

        // Get store coordinates
        const storeQuery = "SELECT * FROM stores WHERE id IN (?) AND active_status = TRUE";
        
        db.query(storeQuery, [storeIds], (err, storeResults) => {
          if (err) {
            Logger.error("Error fetching stores", err);
            reject(new Error("Failed to fetch stores"));
            return;
          }

          const distances = storeResults.map(store => {
            const distance = calculateDistance(
              warehouse.gps_lat || 48.8566, // Default to Paris if no GPS
              warehouse.gps_lng || 2.3522,
              store.gps_lat,
              store.gps_lng
            );

            return {
              store_id: store.id,
              store_code: store.code,
              store_name: store.name,
              distance_km: roundToDecimals(distance)
            };
          });

          resolve({
            warehouse_id: warehouseId,
            warehouse_name: warehouse.location,
            distances: distances,
            total_stores: distances.length
          });
        });
      });
    });
  }

  /**
   * Generate optimized delivery schedule
   * @param {number} warehouseId 
   * @param {number} weekNumber 
   * @param {number} year 
   * @param {number} maxDailyDistance 
   * @returns {Promise<object>}
   */
  static async generateSchedule(warehouseId, weekNumber, year, maxDailyDistance = 600) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      // Get all active stores with contracts
      const storesQuery = `
        SELECT s.*, c.id as contract_id, c.contract_type, c.frequency_per_week
        FROM stores s
        JOIN contracts c ON s.id = c.store_id
        WHERE s.active_status = TRUE AND c.active_status = TRUE
      `;

      db.query(storesQuery, (err, stores) => {
        if (err) {
          Logger.error("Error fetching stores", err);
          reject(new Error("Failed to fetch stores"));
          return;
        }

        const warehouseQuery = "SELECT * FROM warehouses WHERE id = ?";
        
        db.query(warehouseQuery, [warehouseId], (err, warehouseResults) => {
          if (err || warehouseResults.length === 0) {
            Logger.error("Error fetching warehouse", err);
            reject(new Error("Failed to fetch warehouse"));
            return;
          }

          const warehouse = warehouseResults[0];

          try {
            const result = this._optimizeSchedule(
              stores, 
              warehouse, 
              weekNumber, 
              year, 
              maxDailyDistance, 
              startTime
            );
            
            this._saveScheduleToDatabase(result, warehouseId, weekNumber, year)
              .then(() => resolve(result))
              .catch(reject);
          } catch (error) {
            Logger.error("Schedule optimization error", error);
            reject(new Error("Schedule optimization failed"));
          }
        });
      });
    });
  }

  /**
   * Private method to optimize schedule
   * @private
   */
  static _optimizeSchedule(stores, warehouse, weekNumber, year, maxDailyDistance, startTime) {
    // Calculate distances for optimization
    const storeDistances = {};
    stores.forEach(store => {
      const distance = calculateDistance(
        warehouse.gps_lat || 48.8566,
        warehouse.gps_lng || 2.3522,
        store.gps_lat,
        store.gps_lng
      );
      storeDistances[store.id] = distance;
    });

    // Simple optimization algorithm
    const weekDates = getWeekDates(year, weekNumber);
    const dayNames = getDayNames();

    const schedule = [];
    const dailyDistances = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

    // Separate stores by contract type
    const comeauStores = stores.filter(s => s.contract_type === 'COMEAU');
    const comdetStores = stores.filter(s => s.contract_type === 'COMDET');

    // Schedule COMDET stores (1 delivery per week) - prefer early in week
    comdetStores.forEach(store => {
      const distance = storeDistances[store.id];
      let scheduled = false;

      for (let day = 0; day < 7 && !scheduled; day++) {
        if (dailyDistances[day] + distance <= maxDailyDistance) {
          schedule.push({
            store_id: store.id,
            contract_id: store.contract_id,
            warehouse_id: warehouse.id,
            delivery_date: weekDates[day].toISOString().split('T')[0],
            delivery_day_of_week: dayNames[day],
            delay_days: 0,
            estimated_distance_km: distance,
            week_number: weekNumber,
            year: year
          });
          dailyDistances[day] += distance;
          scheduled = true;
        }
      }

      if (!scheduled) {
        // If can't fit in any day, schedule with delay
        const minDay = dailyDistances.indexOf(Math.min(...dailyDistances));
        schedule.push({
          store_id: store.id,
          contract_id: store.contract_id,
          warehouse_id: warehouse.id,
          delivery_date: weekDates[minDay].toISOString().split('T')[0],
          delivery_day_of_week: dayNames[minDay],
          delay_days: 1,
          estimated_distance_km: distance,
          week_number: weekNumber,
          year: year
        });
      }
    });

    // Schedule COMEAU stores (3 deliveries per week) - spread across week
    comeauStores.forEach(store => {
      const distance = storeDistances[store.id];
      let deliveriesScheduled = 0;
      const targetDays = [0, 2, 4]; // Mon, Wed, Fri preferred

      targetDays.forEach(day => {
        if (deliveriesScheduled < 3 && dailyDistances[day] + distance <= maxDailyDistance) {
          schedule.push({
            store_id: store.id,
            contract_id: store.contract_id,
            warehouse_id: warehouse.id,
            delivery_date: weekDates[day].toISOString().split('T')[0],
            delivery_day_of_week: dayNames[day],
            delay_days: 0,
            estimated_distance_km: distance,
            week_number: weekNumber,
            year: year
          });
          dailyDistances[day] += distance;
          deliveriesScheduled++;
        }
      });

      // Fill remaining deliveries on other days
      for (let day = 0; day < 7 && deliveriesScheduled < 3; day++) {
        if (!targetDays.includes(day) && dailyDistances[day] + distance <= maxDailyDistance) {
          schedule.push({
            store_id: store.id,
            contract_id: store.contract_id,
            warehouse_id: warehouse.id,
            delivery_date: weekDates[day].toISOString().split('T')[0],
            delivery_day_of_week: dayNames[day],
            delay_days: 0,
            estimated_distance_km: distance,
            week_number: weekNumber,
            year: year
          });
          dailyDistances[day] += distance;
          deliveriesScheduled++;
        }
      }
    });

    const executionTime = (Date.now() - startTime) / 1000;
    const totalDistance = dailyDistances.reduce((sum, dist) => sum + dist, 0);

    return {
      schedule,
      summary: {
        total_deliveries: schedule.length,
        total_distance_km: roundToDecimals(totalDistance),
        daily_distances: dailyDistances.map(d => roundToDecimals(d)),
        execution_time_seconds: executionTime,
        stores_served: stores.length,
        comeau_deliveries: schedule.filter(s => stores.find(st => st.id === s.store_id)?.contract_type === 'COMEAU').length,
        comdet_deliveries: schedule.filter(s => stores.find(st => st.id === s.store_id)?.contract_type === 'COMDET').length
      },
      parameters: {
        warehouse_id: warehouse.id,
        max_daily_distance: maxDailyDistance,
        total_stores: stores.length,
        comeau_stores: comeauStores.length,
        comdet_stores: comdetStores.length
      }
    };
  }

  /**
   * Save schedule to database
   * @private
   */
  static async _saveScheduleToDatabase(result, warehouseId, weekNumber, year) {
    return new Promise((resolve, reject) => {
      const { schedule, summary, parameters } = result;

      // Save optimization run
      const optimizationQuery = `
        INSERT INTO optimization_runs (week_number, year, parameters_json, total_distance_km, stores_served, execution_time_seconds, status, created_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?, 'completed', 1)
      `;

      db.query(optimizationQuery, [
        weekNumber, 
        year, 
        JSON.stringify(parameters), 
        summary.total_distance_km, 
        summary.stores_served, 
        summary.execution_time_seconds
      ], (err, optimizationResult) => {
        if (err) {
          Logger.error("Error saving optimization run", err);
        }

        result.optimization_run_id = optimizationResult ? optimizationResult.insertId : null;

        if (schedule.length === 0) {
          resolve();
          return;
        }

        // Clear existing schedules for this week/year/warehouse
        const clearQuery = "DELETE FROM delivery_schedules WHERE week_number = ? AND year = ? AND warehouse_id = ?";
        
        db.query(clearQuery, [weekNumber, year, warehouseId], (clearErr) => {
          if (clearErr) {
            Logger.error("Error clearing existing schedules", clearErr);
          }

          // Insert new schedules
          const insertQuery = `
            INSERT INTO delivery_schedules
            (store_id, contract_id, warehouse_id, delivery_date, delivery_day_of_week, delay_days, estimated_distance_km, week_number, year)
            VALUES ?
          `;

          const scheduleValues = schedule.map(s => [
            s.store_id, s.contract_id, s.warehouse_id, s.delivery_date,
            s.delivery_day_of_week, s.delay_days, s.estimated_distance_km, s.week_number, s.year
          ]);

          db.query(insertQuery, [scheduleValues], (insertErr) => {
            if (insertErr) {
              Logger.error("Error saving schedules", insertErr);
              reject(new Error("Failed to save schedules"));
              return;
            }

            Logger.info("Schedule saved successfully", { 
              weekNumber, 
              year, 
              warehouseId, 
              totalDeliveries: schedule.length 
            });
            resolve();
          });
        });
      });
    });
  }
}

module.exports = OptimizationService;
