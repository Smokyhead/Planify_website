const { db } = require("../config/database");
const Logger = require("../utils/logger");
const { createApiResponse } = require("../utils/helpers");

class WarehouseController {
  /**
   * Get all warehouses
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getWarehouses(req, res) {
    try {
      const includeInactive = req.query.include_inactive === 'true';

      let query = "SELECT * FROM warehouses";

      if (!includeInactive) {
        query += " WHERE active_status = TRUE OR active_status IS NULL";
      }

      query += " ORDER BY created_at DESC";

      db.query(query, (err, results) => {
        if (err) {
          Logger.error("Error fetching warehouses", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to fetch warehouses"));
        }
        res.json(createApiResponse(true, results));
      });
    } catch (error) {
      Logger.error("Get warehouses controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch warehouses"));
    }
  }

  /**
   * Get single warehouse by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getWarehouse(req, res) {
    try {
      const warehouseId = req.params.id;

      const query = "SELECT * FROM warehouses WHERE id = ?";

      db.query(query, [warehouseId], (err, results) => {
        if (err) {
          Logger.error("Error fetching warehouse", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to fetch warehouse"));
        }

        if (results.length === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Warehouse not found"));
        }

        res.json(createApiResponse(true, results[0]));
      });
    } catch (error) {
      Logger.error("Get warehouse controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch warehouse"));
    }
  }

  /**
   * Create new warehouse
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async createWarehouse(req, res) {
    try {
      const { code, location, capacity_km, schedule, gps_lat, gps_lng } = req.body;

      const query = `
        INSERT INTO warehouses (code, location, capacity_km, schedule, gps_lat, gps_lng, active_status)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
      `;

      db.query(query, [code, location, capacity_km, schedule, gps_lat, gps_lng], (err, result) => {
        if (err) {
          Logger.error("Database insert error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to add warehouse"));
        }

        Logger.info("Warehouse created successfully", { 
          warehouseId: result.insertId, 
          code, 
          userId: req.user?.id 
        });

        res.status(201).json(createApiResponse(true, {
          id: result.insertId,
          code,
          location
        }, "Warehouse added successfully"));
      });
    } catch (error) {
      Logger.error("Create warehouse controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to add warehouse"));
    }
  }

  /**
   * Update warehouse
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async updateWarehouse(req, res) {
    try {
      const warehouseId = req.params.id;
      const { code, location, capacity_km, schedule, gps_lat, gps_lng, active_status } = req.body;

      const query = `
        UPDATE warehouses
        SET code = ?, location = ?, capacity_km = ?, schedule = ?, gps_lat = ?, gps_lng = ?, active_status = ?
        WHERE id = ?
      `;

      const activeStatusValue = active_status !== undefined ? active_status : true;

      db.query(query, [code, location, capacity_km, schedule, gps_lat, gps_lng, activeStatusValue, warehouseId], (err, result) => {
        if (err) {
          Logger.error("Database update error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to update warehouse"));
        }

        if (result.affectedRows === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Warehouse not found"));
        }

        Logger.info("Warehouse updated successfully", { 
          warehouseId, 
          userId: req.user?.id 
        });

        res.json(createApiResponse(true, {
          id: warehouseId,
          code,
          location
        }, "Warehouse updated successfully"));
      });
    } catch (error) {
      Logger.error("Update warehouse controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to update warehouse"));
    }
  }

  /**
   * Delete warehouse (soft delete)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async deleteWarehouse(req, res) {
    try {
      const warehouseId = req.params.id;

      const query = `
        UPDATE warehouses
        SET active_status = FALSE
        WHERE id = ?
      `;

      db.query(query, [warehouseId], (err, result) => {
        if (err) {
          Logger.error("Database delete error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to delete warehouse"));
        }

        if (result.affectedRows === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Warehouse not found"));
        }

        Logger.info("Warehouse deleted successfully", { 
          warehouseId, 
          userId: req.user?.id 
        });

        res.json(createApiResponse(true, {
          id: warehouseId
        }, "Warehouse deleted successfully"));
      });
    } catch (error) {
      Logger.error("Delete warehouse controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to delete warehouse"));
    }
  }
}

module.exports = WarehouseController;
