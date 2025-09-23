# Design Document

## Overview

This design addresses the critical issues with constraint group stock display and management in the trading dashboard. The current implementation has several problems:

1. **Data Flow Issue**: While stocks are properly saved to constraint groups in the backend, the frontend display logic doesn't properly show individual stocks within groups
2. **UI Inconsistency**: The dashboard shows group-level information but doesn't expand to show individual stocks with their specific triggers
3. **Management Limitations**: Users cannot easily see, add, remove, or modify individual stock triggers within groups
4. **Inefficient UI**: Unnecessary dropdowns appear even for single-stock scenarios

The solution involves enhancing both the frontend display logic and the user interface components to properly handle constraint group stock management.

## Architecture

### Current Data Flow
```
Backend: ConstraintGroup -> contains stocks[] and stockGroups[]
Frontend: constraintPositionsService -> flattens all stocks into ConstraintPosition[]
Dashboard: Shows flattened list but loses group context for individual stock management
```

### Enhanced Data Flow
```
Backend: ConstraintGroup -> contains stocks[] and stockGroups[] (unchanged)
Frontend: Enhanced display logic -> maintains group context while showing individual stocks
Dashboard: Shows grouped view with expandable individual stock management
```

## Components and Interfaces

### 1. Enhanced ConstraintPositionList Component

**Current Issues:**
- Groups are displayed but individual stocks within groups are not clearly shown
- Stock-level trigger management is complex and not intuitive
- Add/remove stock functionality exists but is buried in the UI

**Design Changes:**

#### Group Display Structure
```typescript
interface GroupDisplayData {
  group: ConstraintGroup;
  stocks: StockDisplayData[];
  isExpanded: boolean;
  totalValue: number;
  activePositions: number;
}

interface StockDisplayData {
  symbol: string;
  position?: Position;
  currentPrice: number;
  triggers: StockTriggers;
  isCustomTriggers: boolean; // true if different from group defaults
  status: 'watching' | 'position' | 'triggered';
}

interface StockTriggers {
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
}
```

#### UI Layout Structure
```
Constraint Group Header
├── Group Name & Status
├── Group-level Triggers Summary
├── Action Buttons (Edit Group, Toggle, Delete)
└── Expand/Collapse Button

Expanded Group Content (when expanded)
├── Stock List Header
│   ├── "Stocks in this group (X)"
│   └── "Add Stock" Button
├── Individual Stock Rows
│   ├── Stock Symbol & Company Name
│   ├── Current Price & Status
│   ├── Trigger Values (with custom indicator)
│   ├── Position Info (if any)
│   └── Stock Actions (Edit, Remove)
└── Add Stock Form (when adding)
```

### 2. Enhanced Stock Management Interface

#### Smart Dropdown Logic
- **Single Stock**: No dropdown, direct display
- **Multiple Stocks**: Collapsible interface with expand/collapse
- **Empty Group**: Clear message with "Add Stock" call-to-action

#### Individual Stock Editing
```typescript
interface StockEditState {
  groupId: string;
  stockSymbol: string;
  isEditing: boolean;
  editValues: StockTriggers;
  isCustom: boolean; // whether this stock has custom triggers
}
```

### 3. Enhanced Data Processing Service

#### ConstraintPositionsService Enhancement
The service needs to be enhanced to maintain group context while providing individual stock data:

```typescript
interface EnhancedConstraintPosition extends ConstraintPosition {
  groupId?: string;
  groupName?: string;
  hasCustomTriggers?: boolean;
  groupDefaultTriggers?: StockTriggers;
}
```

#### Group Data Processing
```typescript
interface ProcessedGroupData {
  group: ConstraintGroup;
  individualStocks: string[]; // direct stocks in group
  stockGroupStocks: string[]; // stocks from stock groups
  allStocks: string[]; // combined unique list
  stockPositions: Map<string, Position>;
  stockPrices: Map<string, number>;
}
```

## Data Models

### Frontend Type Enhancements

```typescript
// Enhanced constraint position to include group context
interface EnhancedConstraintPosition extends ConstraintPosition {
  groupId?: string;
  groupName?: string;
  hasCustomTriggers?: boolean;
  groupDefaultTriggers?: {
    buyTriggerPercent: number;
    sellTriggerPercent: number;
    profitTriggerPercent?: number;
    buyAmount: number;
    sellAmount: number;
  };
}

// UI state for group management
interface GroupUIState {
  expandedGroups: Set<string>;
  editingGroup: string | null;
  editingStock: string | null; // format: "groupId-stockSymbol"
  addingStockToGroup: string | null;
  editValues: StockTriggers;
}
```

### Backend Model Enhancements

The backend models are already sufficient, but we need to ensure proper data retrieval:

```typescript
// Ensure ConstraintGroup includes stockOverrides
interface ConstraintGroup {
  // ... existing fields
  stockOverrides?: { [stockSymbol: string]: StockConstraintOverride };
}
```

## Error Handling

### Frontend Error Scenarios
1. **Failed to load group data**: Show error state with retry option
2. **Failed to add/remove stock**: Show toast error, revert UI state
3. **Failed to update triggers**: Show validation errors, maintain edit state
4. **Network connectivity issues**: Show offline indicator, queue actions

### Backend Error Scenarios
1. **Stock already in group**: Return 409 Conflict with clear message
2. **Stock not found**: Return 404 with stock symbol validation
3. **Invalid trigger values**: Return 400 with specific validation errors
4. **Group not found**: Return 404 with group context

## Testing Strategy

### Unit Tests
1. **Data Processing Logic**
   - Test constraint position flattening with group context
   - Test stock aggregation from multiple stock groups
   - Test custom trigger override logic

2. **Component Logic**
   - Test group expansion/collapse state management
   - Test stock add/remove operations
   - Test individual stock trigger editing

### Integration Tests
1. **API Integration**
   - Test constraint group CRUD operations
   - Test stock management within groups
   - Test trigger override functionality

2. **UI Flow Tests**
   - Test complete group creation and stock management flow
   - Test error handling and recovery scenarios
   - Test responsive behavior with different group sizes

### User Acceptance Tests
1. **Group Management Workflow**
   - Create group with multiple stocks
   - Verify all stocks appear in dashboard
   - Add/remove stocks from existing group
   - Modify individual stock triggers

2. **Display Logic Validation**
   - Single stock group shows no dropdown
   - Multiple stock group shows collapsible interface
   - Custom triggers are clearly indicated
   - Group summaries reflect current state

## Implementation Approach

### Phase 1: Data Layer Enhancement
1. Enhance constraintPositionsService to maintain group context
2. Add proper error handling and loading states
3. Implement efficient data caching and updates

### Phase 2: UI Component Updates
1. Refactor ConstraintPositionList to show grouped stocks
2. Implement smart dropdown logic based on stock count
3. Add intuitive stock management interface

### Phase 3: Individual Stock Management
1. Implement inline editing for individual stock triggers
2. Add clear indicators for custom vs. group default triggers
3. Implement add/remove stock functionality with proper validation

### Phase 4: Polish and Optimization
1. Add loading states and smooth transitions
2. Implement proper error handling and user feedback
3. Optimize performance for large numbers of groups/stocks

## Key Design Decisions

### 1. Maintain Group Context
**Decision**: Keep group structure visible in the UI rather than flattening everything
**Rationale**: Users need to understand which stocks belong to which groups for effective management

### 2. Inline Editing Approach
**Decision**: Use inline editing for individual stock triggers rather than modal dialogs
**Rationale**: Faster workflow, better user experience, maintains context

### 3. Smart UI Adaptation
**Decision**: Adapt UI based on content (single vs. multiple stocks)
**Rationale**: Cleaner interface, reduces cognitive load, improves usability

### 4. Clear Custom Trigger Indication
**Decision**: Visually distinguish stocks with custom triggers from group defaults
**Rationale**: Users need to understand which stocks have been customized

This design maintains backward compatibility while significantly improving the user experience for constraint group management.