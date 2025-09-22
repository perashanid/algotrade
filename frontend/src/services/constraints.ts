import api from './api';
import { APIResponse, TradingConstraint, CreateConstraintRequest, UpdateConstraintRequest } from '../types';

export const constraintsService = {
  async getConstraints(): Promise<TradingConstraint[]> {
    const response = await api.get<APIResponse<TradingConstraint[]>>('/constraints');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch constraints');
  },

  async createConstraint(constraint: CreateConstraintRequest): Promise<TradingConstraint> {
    const response = await api.post<APIResponse<TradingConstraint>>('/constraints', constraint);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to create constraint');
  },

  async updateConstraint(id: string, updates: UpdateConstraintRequest): Promise<TradingConstraint> {
    const response = await api.put<APIResponse<TradingConstraint>>(`/constraints/${id}`, updates);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to update constraint');
  },

  async deleteConstraint(id: string): Promise<void> {
    const response = await api.delete<APIResponse<null>>(`/constraints/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete constraint');
    }
  },

  async toggleConstraint(id: string, isActive: boolean): Promise<TradingConstraint> {
    return this.updateConstraint(id, { isActive });
  }
};