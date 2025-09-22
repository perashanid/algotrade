import api from './api';
import { APIResponse, StockGroup, CreateStockGroupRequest } from '../types';

export const stockGroupsService = {
  async getStockGroups(): Promise<StockGroup[]> {
    const response = await api.get<APIResponse<StockGroup[]>>('/stock-groups');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch stock groups');
  },

  async createStockGroup(groupData: CreateStockGroupRequest): Promise<StockGroup> {
    const response = await api.post<APIResponse<StockGroup>>('/stock-groups', groupData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to create stock group');
  },

  async updateStockGroup(id: string, updates: Partial<CreateStockGroupRequest>): Promise<StockGroup> {
    const response = await api.put<APIResponse<StockGroup>>(`/stock-groups/${id}`, updates);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to update stock group');
  },

  async deleteStockGroup(id: string): Promise<void> {
    const response = await api.delete<APIResponse<null>>(`/stock-groups/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete stock group');
    }
  }
};