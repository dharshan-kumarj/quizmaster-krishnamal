import { Question } from '../types';

export const quizQuestions: Question[] = [
  {
    id: 1,
    question: "Which KPI best measures customer loyalty?",
    options: [
      "Conversion Rate",
      "Net Promoter Score (NPS)",
      "Customer Acquisition Cost",
      "Click Through Rate"
    ],
    correctAnswer: "Net Promoter Score (NPS)"
  },
  {
    id: 2,
    question: "If a company's expenses increase but revenue stays the same, what happens to profit?",
    options: [
      "Increases",
      "Decreases",
      "Remains unchanged",
      "Doubles"
    ],
    correctAnswer: "Decreases"
  },
  {
    id: 3,
    question: "Which chart is MOST suitable to show sales trend over 12 months?",
    options: [
      "Pie chart",
      "Bar chart",
      "Line chart",
      "Histogram"
    ],
    correctAnswer: "Line chart"
  },
  {
    id: 4,
    question: "What does CAC stand for in marketing analytics?",
    options: [
      "Cost After Conversion",
      "Customer Acquisition Cost",
      "Customer Average Consumption",
      "Cost of Annual Campaign"
    ],
    correctAnswer: "Customer Acquisition Cost"
  },
  {
    id: 5,
    question: "Which type of analytics answers the question \"What is likely to happen next?\"",
    options: [
      "Descriptive",
      "Diagnostic",
      "Predictive",
      "Prescriptive"
    ],
    correctAnswer: "Predictive"
  },
  {
    id: 6,
    question: "Which factor directly improves a company's profit margin?",
    options: [
      "Increasing costs",
      "Reducing revenue",
      "Reducing operating expenses",
      "Increasing debt"
    ],
    correctAnswer: "Reducing operating expenses"
  },
  {
    id: 7,
    question: "In A/B testing, what is compared?",
    options: [
      "Two datasets",
      "Two business strategies or versions",
      "Two markets",
      "Two time periods"
    ],
    correctAnswer: "Two business strategies or versions"
  },
  {
    id: 8,
    question: "What does break-even analysis identify?",
    options: [
      "Maximum profit level",
      "Minimum sales needed to avoid loss",
      "Market demand",
      "Competitor pricing"
    ],
    correctAnswer: "Minimum sales needed to avoid loss"
  },
  {
    id: 9,
    question: "Which metric is MOST important for subscription-based businesses?",
    options: [
      "Footfall",
      "Market Share",
      "Churn Rate",
      "Inventory Turnover"
    ],
    correctAnswer: "Churn Rate"
  },
  {
    id: 10,
    question: "If demand is highly elastic, a small price increase will:",
    options: [
      "Increase revenue",
      "Decrease quantity demanded significantly",
      "Have no effect",
      "Increase profit always"
    ],
    correctAnswer: "Decrease quantity demanded significantly"
  },
  {
    id: 11,
    question: "Which tool is commonly used to build business dashboards?",
    options: [
      "MS Word",
      "Power BI / Tableau",
      "Photoshop",
      "AutoCAD"
    ],
    correctAnswer: "Power BI / Tableau"
  },
  {
    id: 12,
    question: "What does ROI help managers decide?",
    options: [
      "Employee productivity",
      "Whether an investment is worth it",
      "Market size",
      "Customer satisfaction"
    ],
    correctAnswer: "Whether an investment is worth it"
  },
  {
    id: 13,
    question: "Which analysis helps identify high-value customers?",
    options: [
      "Market basket analysis",
      "Customer Lifetime Value (CLV)",
      "PESTLE analysis",
      "SWOT analysis"
    ],
    correctAnswer: "Customer Lifetime Value (CLV)"
  },
  {
    id: 14,
    question: "What does inventory turnover measure?",
    options: [
      "Total inventory value",
      "How quickly inventory is sold",
      "Warehouse size",
      "Supplier efficiency"
    ],
    correctAnswer: "How quickly inventory is sold"
  },
  {
    id: 15,
    question: "Which Indian company is known globally for IT consulting?",
    options: [
      "Tata Motors",
      "Infosys",
      "Reliance Retail",
      "Flipkart"
    ],
    correctAnswer: "Infosys"
  },
  {
    id: 16,
    question: "Which metric best evaluates marketing campaign performance?",
    options: [
      "CTR (Click Through Rate)",
      "Gross Profit",
      "Net Worth",
      "Working Capital"
    ],
    correctAnswer: "CTR (Click Through Rate)"
  },
  {
    id: 17,
    question: "What is the primary purpose of data visualization?",
    options: [
      "Store data",
      "Simplify complex data for understanding",
      "Increase data size",
      "Replace analysis"
    ],
    correctAnswer: "Simplify complex data for understanding"
  },
  {
    id: 18,
    question: "What does market share indicate?",
    options: [
      "Company's profit",
      "Company's sales relative to total market",
      "Customer satisfaction",
      "Brand reputation"
    ],
    correctAnswer: "Company's sales relative to total market"
  },
  {
    id: 19,
    question: "Which sector includes IT services, banking, and insurance?",
    options: [
      "Primary",
      "Secondary",
      "Tertiary",
      "Quaternary"
    ],
    correctAnswer: "Tertiary"
  },
  {
    id: 20,
    question: "Which analytics type recommends actions to take?",
    options: [
      "Descriptive",
      "Diagnostic",
      "Predictive",
      "Prescriptive"
    ],
    correctAnswer: "Prescriptive"
  }
];

export const QUIZ_TIME_LIMIT_SECONDS = 20 * 60; // 20 minutes
