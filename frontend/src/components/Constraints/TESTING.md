# Constraint UI Fixes - Testing Guide

## Manual Testing Checklist

### 1. Navigation Functionality
- [ ] Click on "AlgoTrader" logo in top navigation
- [ ] Verify it navigates to `/dashboard`
- [ ] Test from different pages (constraints, analytics, etc.)
- [ ] Verify hover state shows cursor pointer

### 2. Delete Button Functionality

#### Individual Constraints (Legacy View)
- [ ] Navigate to Constraints page → Legacy tab
- [ ] Create a test constraint if none exist
- [ ] Click delete button (trash icon)
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion and verify constraint is removed
- [ ] Check browser console for any errors

#### Constraint Groups
- [ ] Navigate to Constraints page → Constraints tab
- [ ] Create a test constraint group if none exist
- [ ] Click delete button (trash icon) on a group
- [ ] Verify confirmation dialog with group name
- [ ] Confirm deletion and verify group is removed
- [ ] Check browser console for any errors

### 3. Add Stock Functionality

#### From Main Constraints Page
- [ ] Navigate to Constraints page → Constraints tab
- [ ] Expand a constraint group (click chevron)
- [ ] Click "Add Stock" button in ConstraintGroupStocks section
- [ ] Verify stock search input appears
- [ ] Search for a stock (e.g., "AAPL")
- [ ] Select stock and verify it's added to group
- [ ] Check browser console for successful API call

#### From Dashboard
- [ ] Navigate to Dashboard
- [ ] Verify constraint groups are displayed
- [ ] Test quick action buttons (edit, toggle, delete)

### 4. Stock Dropdown/Expansion

#### Group Expansion
- [ ] Navigate to Constraints page → Constraints tab
- [ ] Click chevron icon to expand a constraint group
- [ ] Verify ConstraintGroupStocks component loads
- [ ] Verify stock count is accurate in header
- [ ] Check that all stocks are displayed

#### Stock Details
- [ ] In expanded group, verify each stock shows:
  - [ ] Stock symbol and company name
  - [ ] Current trigger percentages
  - [ ] Buy/sell amounts
  - [ ] Custom override indicators (if any)

### 5. Edit and Remove Stock Functionality

#### Edit Stock Triggers
- [ ] In expanded constraint group, click edit button on a stock
- [ ] Verify inline editing form appears
- [ ] Modify trigger percentages and amounts
- [ ] Click Save and verify changes are applied
- [ ] Check browser console for successful API call
- [ ] Verify "Custom" badge appears if overriding group defaults

#### Remove Stock from Group
- [ ] In expanded constraint group, click remove button (trash icon)
- [ ] Verify confirmation dialog appears
- [ ] Confirm removal and verify stock is removed from group
- [ ] Check browser console for successful API call

### 6. Dashboard Management Capabilities

#### Quick Actions
- [ ] Navigate to Dashboard
- [ ] Locate Constraint Groups widget
- [ ] Test edit button (should navigate to constraints page)
- [ ] Test toggle button (activate/deactivate group)
- [ ] Test delete button with confirmation
- [ ] Verify loading states during operations
- [ ] Check that actions update the display immediately

### 7. Error Handling and User Feedback

#### Success Notifications
- [ ] Perform any CRUD operation
- [ ] Verify green toast notification appears
- [ ] Verify notification message is descriptive

#### Error Scenarios
- [ ] Disconnect internet and try operations
- [ ] Verify red toast notifications for failures
- [ ] Check browser console for error logging
- [ ] Verify UI remains stable after errors

#### Loading States
- [ ] Perform operations and verify loading indicators
- [ ] Check that buttons are disabled during operations
- [ ] Verify spinners appear where appropriate

### 8. Cross-Component Consistency

#### State Synchronization
- [ ] Make changes in main constraints page
- [ ] Navigate to dashboard and verify changes are reflected
- [ ] Make changes in dashboard
- [ ] Navigate to constraints page and verify consistency

#### Navigation Flow
- [ ] Test all navigation paths between components
- [ ] Verify data refreshes appropriately
- [ ] Check that React Query cache invalidation works

## API Endpoint Testing

### New Endpoints Added
Test these endpoints manually or with API client:

#### Add Stock to Group
```
POST /api/constraint-groups/{id}/stocks
Body: { "stockSymbol": "AAPL" }
```

#### Remove Stock from Group
```
DELETE /api/constraint-groups/{id}/stocks/{symbol}/remove
```

#### Update Stock Constraints
```
PUT /api/constraint-groups/{id}/stocks/{symbol}
Body: { "buyTriggerPercent": -5, "sellTriggerPercent": 10, ... }
```

## Browser Console Debugging

During testing, monitor browser console for:
- [ ] Successful API calls with proper request/response logging
- [ ] Error messages with stack traces
- [ ] No unexpected JavaScript errors
- [ ] Proper state management logging

## Performance Testing

- [ ] Test with multiple constraint groups (10+)
- [ ] Test with groups containing many stocks (20+)
- [ ] Verify UI remains responsive
- [ ] Check for memory leaks during extended use

## Accessibility Testing

- [ ] Test keyboard navigation
- [ ] Verify ARIA labels on buttons
- [ ] Check color contrast for all states
- [ ] Test with screen reader (if available)

## Cross-Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (latest)

## Mobile Responsiveness

- [ ] Test on mobile viewport (375px width)
- [ ] Verify buttons are touch-friendly
- [ ] Check that modals and forms work on mobile
- [ ] Test landscape and portrait orientations