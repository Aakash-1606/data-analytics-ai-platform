# System Architecture - Data Analytics AI Platform

## 4-Layer Architecture Overview

```
┌──────────────────────────────────────┐
│      FRONTEND LAYER (React/Vue)      │
│   - Real-time Dashboard              │
│   - Data Visualization (Recharts)    │
│   - User Interface Components        │
│   - WebSocket Connections            │
└──────────────┬───────────────────────┘
               │ HTTP/WebSocket
┌──────────────▼───────────────────────┐
│    API LAYER (FastAPI/Flask)         │
│   - REST API Endpoints               │
│   - WebSocket for Real-time Data     │
│   - Request Validation               │
│   - CORS Middleware                  │
└──────────────┬───────────────────────┘
               │ Python Calls
┌──────────────▼───────────────────────┐
│  CORE PROCESSING ENGINE (Python)     │
│   - Data Cleaning Pipeline           │
│   - Feature Engineering              │
│   - ML Model Training/Inference      │
│   - Anomaly Detection                │
│   - Statistical Analysis             │
└──────────────┬───────────────────────┘
               │ DB Queries
┌──────────────▼───────────────────────┐
│      DATA LAYER                      │
│   - PostgreSQL / MongoDB             │
│   - Redis Cache                      │
│   - AWS S3 Data Lake                 │
│   - Data Persistence & Retrieval     │
└──────────────────────────────────────┘
```

---

## 1. FRONTEND LAYER

### Technology Stack
- **Framework**: React.js / Vue.js
- **Charting**: Recharts / Chart.js / Plotly
- **State Management**: Redux / Vuex
- **HTTP Client**: Axios
- **Real-time**: WebSocket

### Key Components

#### Dashboard.jsx
- Displays real-time analytics dashboard
- Shows KPI metrics (Total Records, Accuracy, Processing Time, Active Models)
- Multiple chart types (Line, Bar, Pie)
- Live data updates via WebSocket
- Tabs: Overview, Predictions, Anomalies

#### Features
- **KPI Cards**: Display key metrics with trending data
- **Real-Time Trends Chart**: Line chart showing data trends over time
- **Data Distribution**: Bar chart showing categorical data distribution
- **AI Insights Panel**: Shows machine-learning generated insights
- **Prediction Panel**: Displays predictive model results

### API Connections
- `GET /api/analytics/dashboard` - Fetch dashboard data
- `WebSocket /ws/analytics` - Real-time data stream

---

## 2. API LAYER (FastAPI)

### Main Application (src/api/main.py)

#### Endpoints

**Health & Monitoring**
- `GET /api/health` - Health check endpoint

**Data Management**
- `POST /api/data/upload` - Upload dataset (CSV, JSON, XLSX)
- `GET /api/data/<id>` - Retrieve dataset
- `DELETE /api/data/<id>` - Delete dataset

**Analytics Operations**
- `GET /api/analytics/dashboard` - Get dashboard data with KPIs
- `POST /api/analytics/clean` - Clean and validate dataset
- `POST /api/analytics/predict` - Run prediction model
- `GET /api/analytics/visualize` - Generate visualization

**Reporting**
- `GET /api/reports` - List all reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/<id>/export` - Export report

**Model Management**
- `GET /api/models` - List available ML models
- `POST /api/models/train` - Train new model
- `GET /api/models/<id>/metrics` - Get model performance metrics

**Real-time**
- `WebSocket /ws/analytics` - Real-time data streaming connection

#### Response Format
```json
{
  "kpis": [{"name": "...", "value": "...", "change": 12}],
  "trendData": [{"time": "...", "value": 400}],
  "insights": [{"title": "...", "description": "..."}],
  "timestamp": "2025-11-28T15:00:00"
}
```

---

## 3. CORE PROCESSING ENGINE

### DataProcessor Class (src/core/data_processor.py)

#### Methods

**Data Loading**
- `load_data(file_path)` - Load CSV, JSON, or XLSX files

**Data Cleaning Pipeline**
- `clean_data(df)` - Remove duplicates, handle missing values, remove outliers
- Removes duplicates
- Fills missing values with mean
- Removes outliers using IQR method

**Feature Engineering**
- `feature_engineering(df)` - Create new features and transformations
- Normalize numerical features using StandardScaler
- Create interaction features (feature1 × feature2)
- Apply PCA for dimensionality reduction
- Generate feature importance scores

**Anomaly Detection**
- `detect_anomalies(df)` - Use Isolation Forest algorithm
- Identifies unusual patterns in data
- Returns anomaly flags for each record

**Statistical Analysis**
- `generate_statistics(df)` - Calculate summary statistics
- Record count, feature count
- Missing values count
- Mean, correlation matrix

### MLModelEngine Class

#### Prediction Methods
- `predict_timeseries()` - LSTM for time series forecasting
- `classify_data()` - XGBoost classification
- `cluster_data()` - K-Means clustering (n_clusters parameter)

#### Models Supported
- **Time Series**: ARIMA, Prophet, LSTM
- **Anomaly Detection**: Isolation Forest, LOF
- **Classification**: Random Forest, XGBoost, Neural Networks
- **Clustering**: K-Means, DBSCAN, Hierarchical

---

## 4. DATA LAYER

### Database Options

#### PostgreSQL (Primary)
- **Purpose**: Structured data storage
- **Tables**:
  - `datasets` - Uploaded dataset metadata
  - `analytics_results` - Processing results
  - `models` - ML model information
  - `predictions` - Prediction history
  - `users` - User accounts

#### MongoDB (Alternative)
- **Purpose**: Flexible document storage
- **Collections**:
  - `datasets` - Unstructured data metadata
  - `analytics_logs` - Processing logs
  - `user_preferences` - User settings

#### Redis Cache
- **Purpose**: Fast data caching
- **Keys**:
  - `dashboard:metrics` - Cached KPI data (5min TTL)
  - `model:predictions` - Cached predictions (10min TTL)
  - `session:user_id` - User sessions

#### AWS S3 Data Lake
- **Purpose**: Raw data storage and archival
- **Buckets**:
  - `raw-datasets/` - Uploaded files
  - `processed-data/` - Cleaned datasets
  - `model-artifacts/` - Trained model files
  - `reports/` - Generated reports

### Data Flow
1. User uploads data → S3 (raw-datasets)
2. API triggers processing → Core Engine
3. Cleaned data → PostgreSQL + S3 (processed-data)
4. Results cached → Redis
5. Frontend fetches → API → Redis/PostgreSQL

---

## Integration Points

### Frontend ↔ API
- RESTful HTTP requests (Axios)
- WebSocket for real-time updates
- CORS enabled for cross-origin requests

### API ↔ Core Engine
- Direct Python function calls
- DataFrame passing for data operations
- Model predictions return JSON

### Core Engine ↔ Data Layer
- SQLAlchemy ORM for PostgreSQL
- PyMongo for MongoDB
- Redis-py for caching
- Boto3 for AWS S3

---

## Deployment Architecture

### Development
- Local: Frontend (localhost:3000), API (localhost:8000)

### Production
- Docker containers for each layer
- Kubernetes orchestration
- Load balancer for API scaling
- CDN for frontend assets
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for data storage

---

## Performance Considerations

- API response caching (Redis)
- Database query optimization
- Batch processing for large datasets
- Async processing with Celery
- WebSocket for real-time efficiency
- Horizontal scaling of API layer

---

## Security

- HTTPS/TLS encryption
- JWT authentication
- CORS policy enforcement
- SQL injection prevention (SQLAlchemy)
- Rate limiting on API
- Data encryption at rest (S3)

---

*Last Updated: November 2025*
