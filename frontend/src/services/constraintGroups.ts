import api from './api';
import { APIResponse, ConstraintGroup, CreateConstraintGroupRequest } from '../types';

export const constraintGroupsService = {
  async getConstraintGroups(): Promise<ConstraintGroup[]> {
    const response = await api.get<APIResponse<ConstraintGroup[]>>('/constraint-groups');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch constraint groups');
  },

  async createConstraintGroup(constraintData: CreateConstraintGroupRequest): Promise<ConstraintGroup> {
    const response = await api.post<APIResponse<ConstraintGroup>>('/constraint-groups', constraintData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to create constraint group');
  },

  async toggleConstraintGroup(id: string, isActive: boolean): Promise<ConstraintGroup> {
    const response = await api.put<APIResponse<ConstraintGroup>>(`/constraint-groups/${id}/toggle`, { isActive });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to toggle constraint group');
  },

  async deleteConstraintGroup(id: string): Promise<void> {
    const response = await api.delete<APIResponse<null>>(`/constraint-groups/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete constraint group');
    }
  }
};