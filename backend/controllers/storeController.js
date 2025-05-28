const { db } = require("../config/database");
const Logger = require("../utils/logger");
const { createApiResponse } = require("../utils/helpers");
const config = require("../config/app");

class StoreController {
  /**
   * Get all stores
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getStores(req, res) {
    try {
      const includeInactive = req.query.include_inactive === 'true';

      let query = `
        SELECT s.*, c.contract_type, c.frequency_per_week, c.active_status as contract_active
        FROM stores s
        LEFT JOIN contracts c ON s.id = c.store_id AND c.active_status = TRUE
      `;

      if (!includeInactive) {
        query += ` WHERE s.active_status = TRUE OR s.active_status IS NULL`;
      }

      query += ` ORDER BY s.active_status DESC, s.code`;

      db.query(query, (err, results) => {
        if (err) {
          Logger.error("Error fetching stores", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to fetch stores"));
        }
        res.json(createApiResponse(true, results));
      });
    } catch (error) {
      Logger.error("Get stores controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch stores"));
    }
  }

  /**
   * Get single store by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getStore(req, res) {
    try {
      const storeId = req.params.id;

      const query = `
        SELECT s.*, c.contract_type, c.frequency_per_week, c.active_status as contract_active
        FROM stores s
        LEFT JOIN contracts c ON s.id = c.store_id AND c.active_status = TRUE
        WHERE s.id = ?
      `;

      db.query(query, [storeId], (err, results) => {
        if (err) {
          Logger.error("Error fetching store", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to fetch store"));
        }

        if (results.length === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Store not found"));
        }

        res.json(createApiResponse(true, results[0]));
      });
    } catch (error) {
      Logger.error("Get store controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch store"));
    }
  }

  /**
   * Create new store
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async createStore(req, res) {
    try {
      const { 
        code, 
        name, 
        address, 
        gps_lat, 
        gps_lng, 
        opening_hours, 
        closing_hours, 
        unloading_time_minutes 
      } = req.body;

      const query = `
        INSERT INTO stores (code, name, address, gps_lat, gps_lng, opening_hours, closing_hours, unloading_time_minutes, active_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `;

      const defaultOpeningHours = opening_hours || config.optimization.defaultOpeningHours;
      const defaultClosingHours = closing_hours || config.optimization.defaultClosingHours;
      const defaultUnloadingTime = unloading_time_minutes || config.optimization.defaultUnloadingTime;

      db.query(query, [
        code, 
        name, 
        address, 
        gps_lat, 
        gps_lng, 
        defaultOpeningHours, 
        defaultClosingHours, 
        defaultUnloadingTime
      ], (err, result) => {
        if (err) {
          Logger.error("Database insert error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to add store"));
        }

        Logger.info("Store created successfully", { 
          storeId: result.insertId, 
          code, 
          userId: req.user?.id 
        });

        res.status(201).json(createApiResponse(true, {
          id: result.insertId,
          code,
          name
        }, "Store added successfully"));
      });
    } catch (error) {
      Logger.error("Create store controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to add store"));
    }
  }

  /**
   * Update store
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async updateStore(req, res) {
    try {
      const storeId = req.params.id;
      const { 
        code, 
        name, 
        address, 
        gps_lat, 
        gps_lng, 
        opening_hours, 
        closing_hours, 
        unloading_time_minutes, 
        active_status 
      } = req.body;

      const query = `
        UPDATE stores
        SET code = ?, name = ?, address = ?, gps_lat = ?, gps_lng = ?, opening_hours = ?, closing_hours = ?, unloading_time_minutes = ?, active_status = ?
        WHERE id = ?
      `;

      const activeStatusValue = active_status !== undefined ? active_status : true;

      db.query(query, [
        code, 
        name, 
        address, 
        gps_lat, 
        gps_lng, 
        opening_hours, 
        closing_hours, 
        unloading_time_minutes, 
        activeStatusValue, 
        storeId
      ], (err, result) => {
        if (err) {
          Logger.error("Database update error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to update store"));
        }

        if (result.affectedRows === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Store not found"));
        }

        Logger.info("Store updated successfully", { 
          storeId, 
          userId: req.user?.id 
        });

        res.json(createApiResponse(true, {
          id: storeId,
          code,
          name
        }, "Store updated successfully"));
      });
    } catch (error) {
      Logger.error("Update store controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to update store"));
    }
  }

  /**
   * Delete store (soft delete)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async deleteStore(req, res) {
    try {
      const storeId = req.params.id;

      const query = `
        UPDATE stores
        SET active_status = FALSE
        WHERE id = ?
      `;

      db.query(query, [storeId], (err, result) => {
        if (err) {
          Logger.error("Database delete error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to delete store"));
        }

        if (result.affectedRows === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Store not found"));
        }

        Logger.info("Store deleted successfully", { 
          storeId, 
          userId: req.user?.id 
        });

        res.json(createApiResponse(true, {
          id: storeId
        }, "Store deleted successfully"));
      });
    } catch (error) {
      Logger.error("Delete store controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to delete store"));
    }
  }
}

module.exports = StoreController;
