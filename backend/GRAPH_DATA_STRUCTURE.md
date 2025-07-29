# Financial Insights Graph Data Structure

The financial insights service now provides structured graph data for visualization on the frontend. Here's the complete structure:

## Response Structure

When a user requests financial insights, the response includes:

```javascript
{
  conversationalResponse: "Markdown formatted response...",
  insights: [...],
  actionItems: [...],
  graphData: {
    type: "income|expense|budget|debt|savings|general|summary",
    charts: [...],
    summary: {...}
  },
  insightType: "income|expense|budget|debt|savings|general|summary"
}
```

## Graph Data Types

### 1. Income Insights (`type: "income"`)

```javascript
{
  type: "income",
  charts: [
    {
      title: "Monthly Income Trend",
      type: "line",
      data: [
        { month: "Jan 2024", amount: 5000 },
        { month: "Feb 2024", amount: 5200 },
        // ...
      ]
    },
    {
      title: "Income Stability",
      type: "gauge",
      data: {
        value: 85.5,
        max: 100,
        label: "Stability %"
      }
    }
  ],
  summary: {
    averageMonthly: 5000,
    stability: 85.5,
    trend: "increasing"
  }
}
```

### 2. Expense Insights (`type: "expense"`)

```javascript
{
  type: "expense",
  charts: [
    {
      title: "Spending by Category",
      type: "doughnut",
      data: [
        { label: "Food & Dining", value: 800, percentage: 25.5 },
        { label: "Transportation", value: 600, percentage: 19.1 },
        // ...
      ]
    },
    {
      title: "Monthly Spending Trend",
      type: "line",
      data: [
        { month: "Jan 2024", amount: 3200 },
        { month: "Feb 2024", amount: 3100 },
        // ...
      ]
    }
  ],
  summary: {
    totalMonthly: 3200,
    topCategory: "Food & Dining",
    categoryCount: 8
  }
}
```

### 3. Budget Insights (`type: "budget"`)

```javascript
{
  type: "budget",
  charts: [
    {
      title: "Budget vs Actual Spending",
      type: "bar",
      data: [
        {
          category: "Food & Dining",
          budgeted: 600,
          actual: 800,
          variance: 200
        },
        // ...
      ]
    }
  ],
  summary: {
    categoriesWithBudget: 5,
    totalBudgeted: 3000
  }
}
```

### 4. Debt Insights (`type: "debt"`)

```javascript
{
  type: "debt",
  charts: [
    {
      title: "Debt Breakdown",
      type: "pie",
      data: [
        { label: "Credit Card", value: 5000, percentage: 45.5 },
        { label: "Student Loan", value: 6000, percentage: 54.5 }
      ]
    }
  ],
  summary: {
    totalDebt: 11000,
    debtCount: 2,
    averageInterest: 8.5
  }
}
```

### 5. Savings Insights (`type: "savings"`)

```javascript
{
  type: "savings",
  charts: [
    {
      title: "Savings Rate Over Time",
      type: "line",
      data: [
        { month: "Jan 2024", amount: 1800 },
        { month: "Feb 2024", amount: 1900 },
        // ...
      ]
    },
    {
      title: "Income vs Expenses vs Savings",
      type: "stacked-bar",
      data: {
        income: 5000,
        expenses: 3200,
        savings: 1800
      }
    }
  ],
  summary: {
    savingsRate: 36.0,
    monthlySavings: 1800,
    emergencyFundTarget: 15000
  }
}
```

### 6. General/Summary Insights (`type: "general"` or `type: "summary"`)

```javascript
{
  type: "general",
  charts: [
    {
      title: "Financial Overview",
      type: "donut",
      data: [
        { label: "Income", value: 5000 },
        { label: "Expenses", value: 3200 },
        { label: "Savings", value: 1800 }
      ]
    }
  ],
  summary: {
    income: 5000,
    expenses: 3200,
    savings: 1800
  }
}
```

## Chart Types Supported

- **line**: For trends over time
- **doughnut**: For category breakdowns
- **pie**: For debt or category distributions
- **bar**: For budget vs actual comparisons
- **stacked-bar**: For income/expense/savings breakdown
- **gauge**: For stability or percentage metrics
- **donut**: For general financial overview

## Frontend Implementation

The frontend can use this data to render charts using libraries like:

- Chart.js
- D3.js
- Recharts
- ApexCharts

Example usage:

```javascript
// In your frontend component
const renderChart = (chartData) => {
  switch (chartData.type) {
    case "line":
      return <LineChart data={chartData.data} />;
    case "doughnut":
      return <DoughnutChart data={chartData.data} />;
    case "bar":
      return <BarChart data={chartData.data} />;
    // ... other chart types
  }
};

// Render all charts for an insight
response.graphData.charts.forEach((chart) => {
  renderChart(chart);
});
```

## Insight Types

The `insightType` field indicates what specific analysis was requested:

- `"income"` - Income analysis and trends
- `"expense"` - Spending patterns and categories
- `"budget"` - Budget performance and allocations
- `"debt"` - Debt situation and strategies
- `"savings"` - Savings rate and opportunities
- `"general"` - Overall financial health
- `"summary"` - Initial financial summary

This structure allows the frontend to render appropriate visualizations based on the type of financial insight requested by the user.
