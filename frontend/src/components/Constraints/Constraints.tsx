import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Power, PowerOff, TrendingUp, TrendingDown, Target, Users, Tag } from 'lucide-react';
import { constraintsService } from '../../services/constraints';
import { constraintGroupsService } from '../../services/constraintGroups';
import { stockGroupsService } from '../../services/stockGroups';
import { TradingConstraint, ConstraintGroup, StockGroup, CreateConstraintGroupRequest } from '../../types';
import CreateConstraintModal from './CreateConstraintModal';
import StockGroupManager from './StockGroupManager';
import toast from 'react-hot-toast';

const Constraints: React.FC = () => {
  const [constraints, setConstraints] = useState<TradingConstraint[]>([]);
  const [constraintGroups, setConstraintGroups] = useState<ConstraintGroup[]>([]);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'groups' | 'stock-groups'>('groups');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [constraintsData, constraintGroupsData, stockGroupsData] = await Promise.all([
        constraintsService.getConstraints(),
        constraintGroupsService.getConstraintGroups(),
        stockGroupsService.getStockGroups()
      ]);
      
      setConstraints(constraintsData);
      setConstraintGroups(constraintGroupsData);
      setStockGroups(stockGroupsData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await constraintsService.toggleConstraint(id, !isActive);
      setConstraints(prev => 
        prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c)
      );
      toast.success(`Constraint ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint');
    }
  };

  const handleDelete = async (id: string, stockSymbol: string) => {
    if (!window.confirm(`Are you sure you want to delete the constraint for ${stockSymbol}?`)) {
      return;
    }

    try {
      await constraintsService.deleteConstraint(id);
      setConstraints(prev => prev.filter(c => c.id !== id));
      toast.success('Constraint deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete constraint');
    }
  };

  const handleCreateConstraintGroup = async (constraintData: CreateConstraintGroupRequest) => {
    await constraintGroupsService.createConstraintGroup(constraintData);
    await loadData();
  };

  const handleToggleConstraintGroup = async (id: string, isActive: boolean) => {
    try {
      await constraintGroupsService.toggleConstraintGroup(id, !isActive);
      setConstraintGroups(prev => 
        prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c)
      );
      toast.success(`Constraint group ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle constraint group');
    }
  };

  const handleDeleteConstraintGroup = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await constraintGroupsService.deleteConstraintGroup(id);
      setConstraintGroups(prev => prev.filter(c => c.id !== id));
      toast.success('Constraint group deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete constraint group');
    }
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trading Constraints</h1>
          <p className="text-gray-600 mt-1">Manage your automated trading rules and triggers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('groups')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'groups'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Constraints
            </button>
            <button
              onClick={() => setViewMode('stock-groups')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'stock-groups'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Tag className="h-4 w-4 inline mr-1" />
              Stock Groups
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'individual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="h-4 w-4 inline mr-1" />
              Legacy
            </button>
          </div>

          {/* Create Button */}
          {viewMode !== 'stock-groups' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Constraint Group
            </button>
          )}
        </div>
      </div>

      {viewMode === 'groups' && constraintGroups.length === 0 && constraints.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No constraint groups yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first constraint group to apply trading rules to multiple stocks at once.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Constraint Group
          </button>
        </div>
      ) : viewMode === 'individual' && constraints.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Target className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No individual constraints yet</h3>
          <p className="text-gray-600 mb-6">
            Create individual stock constraints for specific trading rules.
          </p>
          <Link
            to="/constraints/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Individual Constraint
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {viewMode === 'individual' && constraints.map((constraint) => (
            <div key={constraint.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {constraint.stockSymbol}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      constraint.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {constraint.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Buy Trigger */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Buy Trigger</p>
                        <p className="font-medium text-gray-900">
                          {formatPercent(constraint.buyTriggerPercent)} drop
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: {formatCurrency(constraint.buyAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Sell Trigger */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sell Trigger</p>
                        <p className="font-medium text-gray-900">
                          {formatPercent(constraint.sellTriggerPercent)} rise
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: {formatCurrency(constraint.sellAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Profit Trigger */}
                    {constraint.profitTriggerPercent && (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Profit Target</p>
                          <p className="font-medium text-gray-900">
                            {formatPercent(constraint.profitTriggerPercent)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: {formatCurrency(constraint.sellAmount)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    Created: {new Date(constraint.createdAt).toLocaleDateString()}
                    {constraint.updatedAt !== constraint.createdAt && (
                      <span className="ml-4">
                        Updated: {new Date(constraint.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(constraint.id, constraint.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      constraint.isActive
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={constraint.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {constraint.isActive ? (
                      <Power className="h-4 w-4" />
                    ) : (
                      <PowerOff className="h-4 w-4" />
                    )}
                  </button>

                  <Link
                    to={`/constraints/edit/${constraint.id}`}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(constraint.id, constraint.stockSymbol)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {viewMode === 'groups' && constraintGroups.map((constraintGroup) => (
            <div key={constraintGroup.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {constraintGroup.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      constraintGroup.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {constraintGroup.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {constraintGroup.description && (
                    <p className="text-gray-600 mb-3">{constraintGroup.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Buy Trigger */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Buy Trigger</p>
                        <p className="font-medium text-gray-900">
                          {formatPercent(constraintGroup.buyTriggerPercent)} drop
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: {formatCurrency(constraintGroup.buyAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Sell Trigger */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sell Trigger</p>
                        <p className="font-medium text-gray-900">
                          {formatPercent(constraintGroup.sellTriggerPercent)} rise
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: {formatCurrency(constraintGroup.sellAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Profit Trigger */}
                    {constraintGroup.profitTriggerPercent && (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Profit Target</p>
                          <p className="font-medium text-gray-900">
                            {formatPercent(constraintGroup.profitTriggerPercent)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: {formatCurrency(constraintGroup.sellAmount)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stocks */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Applies to {constraintGroup.stocks.length + constraintGroup.stockGroups.length} items:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {constraintGroup.stocks.map((stock) => (
                        <span key={stock} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {stock}
                        </span>
                      ))}
                      {constraintGroup.stockGroups.map((groupId) => {
                        const group = stockGroups.find(g => g.id === groupId);
                        return group ? (
                          <span key={groupId} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {group.name} ({group.stocks.length})
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Created: {new Date(constraintGroup.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleConstraintGroup(constraintGroup.id, constraintGroup.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      constraintGroup.isActive
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={constraintGroup.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {constraintGroup.isActive ? (
                      <Power className="h-4 w-4" />
                    ) : (
                      <PowerOff className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteConstraintGroup(constraintGroup.id, constraintGroup.name)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {viewMode === 'stock-groups' && (
            <StockGroupManager stockGroups={stockGroups} onUpdate={loadData} />
          )}
        </div>
      )}

      {/* Create Constraint Modal */}
      <CreateConstraintModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateConstraintGroup}
        stockGroups={stockGroups}
      />
    </div>
  );
};

export default Constraints;