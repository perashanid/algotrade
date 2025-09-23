# Requirements Document

## Introduction

This feature addresses critical issues with group stock display and management in the trading dashboard. Currently, when users create constraint groups with stocks and triggers, the stocks are not properly displayed in the dashboard, making it impossible for users to see which stocks are in their groups or manage their individual triggers. Additionally, the UI shows unnecessary dropdowns even when only one stock is present.

## Requirements

### Requirement 1

**User Story:** As a trader, I want to see all stocks in my constraint groups displayed in the dashboard, so that I can monitor which stocks are being tracked and their current status.

#### Acceptance Criteria

1. WHEN a user creates a constraint group with stocks THEN the dashboard SHALL display all stocks within that group
2. WHEN a user views the dashboard THEN each constraint group SHALL show the complete list of stocks it contains
3. WHEN stocks are added to a group THEN they SHALL immediately appear in the dashboard without requiring a page refresh
4. WHEN a constraint group is expanded THEN all individual stocks SHALL be visible with their current prices and status

### Requirement 2

**User Story:** As a trader, I want to see and modify individual stock triggers within constraint groups, so that I can customize trading parameters for specific stocks while maintaining group organization.

#### Acceptance Criteria

1. WHEN a user views stocks in a constraint group THEN each stock SHALL display its current trigger values (buy/sell percentages and amounts)
2. WHEN a user clicks edit on an individual stock THEN they SHALL be able to modify that stock's specific triggers
3. WHEN a stock has custom triggers different from the group defaults THEN those custom values SHALL be clearly displayed
4. WHEN a user saves individual stock trigger changes THEN the changes SHALL persist and be immediately reflected in the dashboard
5. WHEN a stock uses group default triggers THEN it SHALL clearly indicate this is inherited from the group

### Requirement 3

**User Story:** As a trader, I want to easily add and remove stocks from constraint groups, so that I can dynamically manage my trading portfolios without recreating entire groups.

#### Acceptance Criteria

1. WHEN a user wants to add a stock to a group THEN they SHALL have an intuitive "Add Stock" button within the group interface
2. WHEN adding a stock THEN the user SHALL be able to search and select from available stocks
3. WHEN a user wants to remove a stock from a group THEN they SHALL have a clear "Remove" option for each stock
4. WHEN a stock is removed from a group THEN it SHALL be immediately removed from the display and database
5. WHEN adding/removing stocks THEN the group's stock count SHALL update automatically

### Requirement 4

**User Story:** As a trader, I want the UI to be clean and efficient, so that I don't see unnecessary interface elements when they're not needed.

#### Acceptance Criteria

1. WHEN a constraint group contains only one stock THEN no dropdown interface SHALL be displayed
2. WHEN a constraint group contains multiple stocks THEN a collapsible/expandable interface SHALL be provided
3. WHEN viewing individual stocks THEN each stock SHALL have a clean, consistent display format
4. WHEN no stocks are present in a group THEN a clear message SHALL indicate the group is empty with an option to add stocks

### Requirement 5

**User Story:** As a trader, I want real-time updates of stock information within groups, so that I can make informed trading decisions based on current market data.

#### Acceptance Criteria

1. WHEN stocks are displayed in groups THEN their current prices SHALL be shown and updated regularly
2. WHEN a stock's price changes significantly THEN the trigger status SHALL be updated accordingly
3. WHEN a stock reaches a trigger condition THEN it SHALL be clearly highlighted in the group display
4. WHEN viewing group summaries THEN aggregate information SHALL reflect the current state of all stocks in the group