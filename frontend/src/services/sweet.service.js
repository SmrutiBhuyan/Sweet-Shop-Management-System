import api from './api.service'

const sweetService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', filters.category)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.lowStock) params.append('lowStock', filters.lowStock)
    
    const queryString = params.toString()
    const url = queryString ? `/sweets?${queryString}` : '/sweets'
    
    const response = await api.get(url)
    return response.data.data
  },

  async getById(id) {
    const response = await api.get(`/sweets/${id}`)
    return response.data.data
  },

  async create(sweetData) {
    const response = await api.post('/sweets', sweetData)
    return response.data.data
  },

  async update(id, sweetData) {
    const response = await api.put(`/sweets/${id}`, sweetData)
    return response.data.data
  },

  async delete(id) {
    const response = await api.delete(`/sweets/${id}`)
    return response.data.data
  },

  async purchase(id, quantity) {
    const response = await api.post(`/sweets/${id}/purchase`, { quantity })
    return response.data.data
  },

  async restock(id, quantity) {
    const response = await api.post(`/sweets/${id}/restock`, { quantity })
    return response.data.data
  },

  async getCategories() {
    const response = await api.get('/sweets/categories')
    return response.data.data
  },

  async getLowStock() {
    const response = await api.get('/sweets/low-stock')
    return response.data.data
  }
}

export default sweetService