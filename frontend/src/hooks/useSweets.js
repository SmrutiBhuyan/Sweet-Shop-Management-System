import { useState, useEffect, useCallback } from 'react'
import sweetService from '../services/sweet.service'
import Toast from '../components/ui/Toast'

export const useSweets = (filters = {}) => {
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSweets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sweetService.getAll(filters)
      setSweets(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch sweets')
      Toast.error('Failed to load sweets. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchSweets()
  }, [fetchSweets])

  const refetch = useCallback(() => {
    fetchSweets()
  }, [fetchSweets])

  const addSweet = useCallback(async (sweetData) => {
    try {
      const newSweet = await sweetService.create(sweetData)
      setSweets(prev => [...prev, newSweet])
      Toast.success('Sweet added successfully!')
      return newSweet
    } catch (err) {
      Toast.error(err.message || 'Failed to add sweet')
      throw err
    }
  }, [])

  const updateSweet = useCallback(async (id, sweetData) => {
    try {
      const updatedSweet = await sweetService.update(id, sweetData)
      setSweets(prev => prev.map(sweet => 
        sweet.id === id ? updatedSweet : sweet
      ))
      Toast.success('Sweet updated successfully!')
      return updatedSweet
    } catch (err) {
      Toast.error(err.message || 'Failed to update sweet')
      throw err
    }
  }, [])

  const deleteSweet = useCallback(async (id) => {
    try {
      await sweetService.delete(id)
      setSweets(prev => prev.filter(sweet => sweet.id !== id))
      Toast.success('Sweet deleted successfully!')
    } catch (err) {
      Toast.error(err.message || 'Failed to delete sweet')
      throw err
    }
  }, [])

  const purchaseSweet = useCallback(async (id, quantity) => {
    try {
      const updatedSweet = await sweetService.purchase(id, quantity)
      setSweets(prev => prev.map(sweet => 
        sweet.id === id ? updatedSweet : sweet
      ))
      Toast.success('Purchase successful!')
      return updatedSweet
    } catch (err) {
      Toast.error(err.message || 'Failed to purchase sweet')
      throw err
    }
  }, [])

  return {
    sweets,
    loading,
    error,
    refetch,
    addSweet,
    updateSweet,
    deleteSweet,
    purchaseSweet
  }
}