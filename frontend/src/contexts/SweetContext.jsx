import React, { createContext, useState, useContext, useCallback } from 'react';
import { sweetAPI } from '../services/api';
import { toast } from 'react-toastify';

// Create Sweet Context
const SweetContext = createContext();

// Custom hook to use sweet context
export const useSweet = () => {
  const context = useContext(SweetContext);
  if (!context) {
    throw new Error('useSweet must be used within a SweetProvider');
  }
  return context;
};

// Sweet Provider Component
export const SweetProvider = ({ children }) => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all sweets with optional filters
  const fetchSweets = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // If there's a search query, use the search endpoint
      if (filters.query && filters.query.trim() !== '') {
        const response = await sweetAPI.searchSweets(filters.query);
        setSweets(response.data.sweets);
      } else {
        // Otherwise, use the regular getAllSweets with filters
        const response = await sweetAPI.getAllSweets(filters);
        setSweets(response.data.sweets);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch sweets');
      toast.error('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Purchase a sweet
  const purchaseSweet = async (sweetId, quantity) => {
    try {
      const response = await sweetAPI.purchaseSweet(sweetId, quantity);
      
      // Update the sweets list with new quantity
      setSweets(sweets.map(sweet => 
        sweet._id === sweetId 
          ? { ...sweet, quantity: response.data.remainingQuantity }
          : sweet
      ));
      
      return { success: true, data: response.data };
    } catch (err) {
      throw new Error(err.message || 'Purchase failed');
    }
  };

  // Create a new sweet
  const createSweet = async (sweetData) => {
    try {
      const response = await sweetAPI.createSweet(sweetData);
      
      // Add new sweet to the list
      setSweets([response.data.sweet, ...sweets]);
      
      return { success: true, data: response.data };
    } catch (err) {
      throw new Error(err.message || 'Failed to create sweet');
    }
  };

  // Update an existing sweet
  const updateSweet = async (sweetId, sweetData) => {
    try {
      const response = await sweetAPI.updateSweet(sweetId, sweetData);
      
      // Update the sweet in the list
      setSweets(sweets.map(sweet => 
        sweet._id === sweetId ? response.data.sweet : sweet
      ));
      
      return { success: true, data: response.data };
    } catch (err) {
      throw new Error(err.message || 'Failed to update sweet');
    }
  };

  // Delete a sweet
  const deleteSweet = async (sweetId) => {
    try {
      await sweetAPI.deleteSweet(sweetId);
      
      // Remove sweet from the list
      setSweets(sweets.filter(sweet => sweet._id !== sweetId));
      
      return { success: true };
    } catch (err) {
      throw new Error(err.message || 'Failed to delete sweet');
    }
  };

  // Search sweets
  const searchSweets = async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sweetAPI.searchSweets(query);
      setSweets(response.data.sweets);
    } catch (err) {
      setError(err.message || 'Search failed');
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Get a single sweet by ID
  const getSweetById = async (sweetId) => {
    try {
      const response = await sweetAPI.getSweetById(sweetId);
      return { success: true, data: response.data };
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch sweet');
    }
  };

  // Value to be provided by context
  const value = {
    sweets,
    loading,
    error,
    fetchSweets,
    purchaseSweet,
    createSweet,
    updateSweet,
    deleteSweet,
    searchSweets,
    getSweetById,
  };

  return (
    <SweetContext.Provider value={value}>
      {children}
    </SweetContext.Provider>
  );
};