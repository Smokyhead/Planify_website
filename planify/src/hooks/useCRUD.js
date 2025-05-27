import { useState, useCallback } from 'react';
import { useAuth } from 'context/AuthContext';

/**
 * Custom hook for CRUD operations
 * Eliminates code duplication across components
 */
export const useCRUD = (baseUrl, entityName = 'item') => {
  const { getAuthHeaders } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Fetch all items
  const fetchAll = useCallback(async (includeInactive = false) => {
    try {
      setLoading(true);
      clearMessages();
      
      const url = `${baseUrl}${includeInactive ? '?include_inactive=true' : ''}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error(`Failed to fetch ${entityName}s`);
      
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, entityName, getAuthHeaders, clearMessages]);

  // Fetch single item
  const fetchOne = useCallback(async (id) => {
    try {
      setLoading(true);
      clearMessages();
      
      const response = await fetch(`${baseUrl}/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error(`Failed to fetch ${entityName}`);
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, entityName, getAuthHeaders, clearMessages]);

  // Create new item
  const create = useCallback(async (itemData) => {
    try {
      setLoading(true);
      clearMessages();
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create ${entityName}`);
      }
      
      const result = await response.json();
      setSuccess(`${entityName} créé avec succès!`);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, entityName, getAuthHeaders, clearMessages]);

  // Update item
  const update = useCallback(async (id, itemData) => {
    try {
      setLoading(true);
      clearMessages();
      
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update ${entityName}`);
      }
      
      const result = await response.json();
      setSuccess(`${entityName} mis à jour avec succès!`);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, entityName, getAuthHeaders, clearMessages]);

  // Delete item (soft delete)
  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      clearMessages();
      
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete ${entityName}`);
      }
      
      const result = await response.json();
      setSuccess(`${entityName} supprimé avec succès!`);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, entityName, getAuthHeaders, clearMessages]);

  return {
    // Data
    data,
    setData,
    loading,
    error,
    success,
    
    // Actions
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    clearMessages,
  };
};

export default useCRUD;
