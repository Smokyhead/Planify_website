const { db } = require("../config/database");
const Logger = require("../utils/logger");
const { createApiResponse } = require("../utils/helpers");

class ContractController {
  /**
   * Get all contracts
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getContracts(req, res) {
    try {
      const includeInactive = req.query.include_inactive === 'true';

      let query = `
        SELECT c.*, s.code as store_code, s.name as store_name
        FROM contracts c
        LEFT JOIN stores s ON c.store_id = s.id
      `;

      if (!includeInactive) {
        query += ` WHERE c.active_status = TRUE`;
      }

      query += ` ORDER BY c.active_status DESC, c.created_at DESC`;

      db.query(query, (err, results) => {
        if (err) {
          Logger.error("Error fetching contracts", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to fetch contracts"));
        }
        res.json(createApiResponse(true, results));
      });
    } catch (error) {
      Logger.error("Get contracts controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch contracts"));
    }
  }

  /**
   * Get single contract by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getContract(req, res) {
    try {
      const contractId = req.params.id;

      const query = `
        SELECT c.*, s.code as store_code, s.name as store_name
        FROM contracts c
        LEFT JOIN stores s ON c.store_id = s.id
        WHERE c.id = ?
      `;

      db.query(query, [contractId], (err, results) => {
        if (err) {
          Logger.error("Error fetching contract", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to fetch contract"));
        }

        if (results.length === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Contract not found"));
        }

        res.json(createApiResponse(true, results[0]));
      });
    } catch (error) {
      Logger.error("Get contract controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to fetch contract"));
    }
  }

  /**
   * Create new contract
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async createContract(req, res) {
    try {
      const { store_id, contract_type, frequency_per_week, start_date, end_date } = req.body;

      // Validate contract type
      if (!['COMEAU', 'COMDET'].includes(contract_type)) {
        return res.status(400).json(createApiResponse(false, null, null, "Invalid contract type. Must be COMEAU or COMDET"));
      }

      // Validate frequency based on contract type
      if (contract_type === 'COMEAU' && frequency_per_week !== 3) {
        return res.status(400).json(createApiResponse(false, null, null, "COMEAU contracts must have frequency of 3 per week"));
      }

      if (contract_type === 'COMDET' && frequency_per_week !== 1) {
        return res.status(400).json(createApiResponse(false, null, null, "COMDET contracts must have frequency of 1 per week"));
      }

      const query = `
        INSERT INTO contracts (store_id, contract_type, frequency_per_week, start_date, end_date)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(query, [store_id, contract_type, frequency_per_week, start_date, end_date], (err, result) => {
        if (err) {
          Logger.error("Database insert error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to add contract"));
        }

        Logger.info("Contract created successfully", { 
          contractId: result.insertId, 
          storeId: store_id,
          contractType: contract_type,
          userId: req.user?.id 
        });

        res.status(201).json(createApiResponse(true, {
          id: result.insertId,
          store_id,
          contract_type,
          frequency_per_week
        }, "Contract added successfully"));
      });
    } catch (error) {
      Logger.error("Create contract controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to add contract"));
    }
  }

  /**
   * Update contract
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async updateContract(req, res) {
    try {
      const contractId = req.params.id;
      const { store_id, contract_type, frequency_per_week, start_date, end_date, active_status } = req.body;

      // Validate contract type
      if (!['COMEAU', 'COMDET'].includes(contract_type)) {
        return res.status(400).json(createApiResponse(false, null, null, "Invalid contract type. Must be COMEAU or COMDET"));
      }

      // Validate frequency based on contract type
      if (contract_type === 'COMEAU' && frequency_per_week !== 3) {
        return res.status(400).json(createApiResponse(false, null, null, "COMEAU contracts must have frequency of 3 per week"));
      }

      if (contract_type === 'COMDET' && frequency_per_week !== 1) {
        return res.status(400).json(createApiResponse(false, null, null, "COMDET contracts must have frequency of 1 per week"));
      }

      const query = `
        UPDATE contracts
        SET store_id = ?, contract_type = ?, frequency_per_week = ?, start_date = ?, end_date = ?, active_status = ?
        WHERE id = ?
      `;

      const activeStatus = active_status !== undefined ? active_status : true;

      db.query(query, [store_id, contract_type, frequency_per_week, start_date, end_date, activeStatus, contractId], (err, result) => {
        if (err) {
          Logger.error("Database update error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to update contract"));
        }

        if (result.affectedRows === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Contract not found"));
        }

        Logger.info("Contract updated successfully", { 
          contractId, 
          userId: req.user?.id 
        });

        res.json(createApiResponse(true, {
          id: contractId,
          store_id,
          contract_type,
          frequency_per_week
        }, "Contract updated successfully"));
      });
    } catch (error) {
      Logger.error("Update contract controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to update contract"));
    }
  }

  /**
   * Delete contract (soft delete)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async deleteContract(req, res) {
    try {
      const contractId = req.params.id;

      const query = `
        UPDATE contracts
        SET active_status = FALSE
        WHERE id = ?
      `;

      db.query(query, [contractId], (err, result) => {
        if (err) {
          Logger.error("Database delete error", err);
          return res.status(500).json(createApiResponse(false, null, null, "Failed to delete contract"));
        }

        if (result.affectedRows === 0) {
          return res.status(404).json(createApiResponse(false, null, null, "Contract not found"));
        }

        Logger.info("Contract deleted successfully", { 
          contractId, 
          userId: req.user?.id 
        });

        res.json(createApiResponse(true, {
          id: contractId
        }, "Contract deleted successfully"));
      });
    } catch (error) {
      Logger.error("Delete contract controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Failed to delete contract"));
    }
  }
}

module.exports = ContractController;
