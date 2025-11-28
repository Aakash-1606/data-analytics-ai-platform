import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, BarChart, PieChart } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    // Real-time updates via WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/analytics');
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setDashboardData(newData);
    };
    return () => ws.close();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Data Analytics Dashboard</h1>
        <div className="filters">
          <button onClick={() => setSelectedMetric('overview')}>Overview</button>
          <button onClick={() => setSelectedMetric('predictions')}>Predictions</button>
          <button onClick={() => setSelectedMetric('anomalies')}>Anomalies</button>
        </div>
      </header>

      <div className="metrics-grid">
        {/* KPI Cards */}
        {dashboardData?.kpis?.map((kpi, idx) => (
          <div key={idx} className="metric-card">
            <h3>{kpi.name}</h3>
            <p className="value">{kpi.value}</p>
            <p className="change">{kpi.change}%</p>
          </div>
        ))}
      </div>

      <div className="charts-section">
        {/* Real-time Line Chart */}
        <div className="chart-container">
          <h2>Real-Time Trends</h2>
          <LineChart data={dashboardData?.trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </div>

        {/* Data Distribution */}
        <div className="chart-container">
          <h2>Data Distribution</h2>
          <BarChart data={dashboardData?.distributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </div>

        {/* Analytics Insights */}
        <div className="insights-panel">
          <h2>AI-Powered Insights</h2>
          <ul className="insights-list">
            {dashboardData?.insights?.map((insight, idx) => (
              <li key={idx}>
                <strong>{insight.title}:</strong> {insight.description}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prediction Panel */}
      {selectedMetric === 'predictions' && (
        <div className="predictions-panel">
          <h2>Predictive Analytics</h2>
          <PieChart data={dashboardData?.predictionData}>
            <Pie dataKey="probability" outerRadius={80} />
            <Legend />
            <Tooltip />
          </PieChart>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
