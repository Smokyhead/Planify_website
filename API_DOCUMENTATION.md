# 📚 Enhanced Planify API Documentation

## Base URL
```
http://localhost:3001/api
```

## 🚀 Core Endpoints

### 1. Schedule Generation
**POST** `/generate-schedule`

Generate optimized delivery schedules with advanced algorithms.

**Request Body:**
```json
{
  "warehouse_id": 1,
  "week_number": 48,
  "year": 2025,
  "max_daily_distance": 600
}
```

**Response:**
```json
{
  "success": true,
  "optimization_run_id": 7,
  "schedule": [
    {
      "store_id": 1,
      "contract_id": 1,
      "warehouse_id": 1,
      "delivery_date": "2025-11-23",
      "delivery_day_of_week": "Monday",
      "delay_days": 0,
      "estimated_distance_km": 0,
      "week_number": 48,
      "year": 2025
    }
  ],
  "summary": {
    "total_deliveries": 19,
    "total_distance_km": 3737.32,
    "daily_distances": [499.3, 546.24, 511.64, 540.16, 595.49, 522.25, 522.25],
    "execution_time_seconds": 0.013,
    "stores_served": 15,
    "comeau_deliveries": 12,
    "comdet_deliveries": 7
  }
}
```

### 2. Distance Calculations
**POST** `/calculate-distances`

Calculate GPS-based distances using Haversine formula.

**Request Body:**
```json
{
  "warehouse_id": 1,
  "store_ids": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "warehouse_id": 1,
  "warehouse_name": "Paris, France",
  "distances": [
    {
      "store_id": 1,
      "store_code": "ST001",
      "store_name": "Store Paris Centre",
      "distance_km": 0
    }
  ],
  "total_stores": 5
}
```

### 3. Export Schedules
**POST** `/export-schedule`

Export schedules in CSV or JSON format.

**Request Body:**
```json
{
  "week_number": 48,
  "year": 2025,
  "warehouse_id": 1,
  "format": "csv"
}
```

**CSV Response:**
```csv
Code,Store,Contract,Mon,DELAY_Mon,Tue,DELAY_Tue,Wed,DELAY_Wed,Thu,DELAY_Thu,Fri,DELAY_Fri,Sat,DELAY_Sat,Sun,DELAY_Sun,Warehouse,Frequency
"ST001","Store Paris Centre","COMEAU","1","0","0","0","1","0","0","0","1","0","0","0","0","0","Paris, France","3"
```

### 4. Analytics & Optimization History
**GET** `/optimization-runs`

Retrieve optimization run history and analytics.

**Response:**
```json
[
  {
    "id": 7,
    "run_date": "2025-05-26T21:54:52.000Z",
    "week_number": 48,
    "year": 2025,
    "parameters_json": {
      "total_stores": 15,
      "warehouse_id": 1,
      "comdet_stores": 7,
      "comeau_stores": 8,
      "max_daily_distance": 600
    },
    "total_distance_km": "3737.32",
    "stores_served": 15,
    "execution_time_seconds": "0.013",
    "status": "completed",
    "error_message": null,
    "created_by_user_id": 1
  }
]
```

### 5. Schedule Retrieval
**GET** `/schedules/:week/:year?warehouse_id=1`

Get generated schedules for a specific week.

**Response:**
```json
[
  {
    "id": 163,
    "store_id": 1,
    "contract_id": 1,
    "warehouse_id": 1,
    "delivery_date": "2025-12-06T23:00:00.000Z",
    "delivery_day_of_week": "Monday",
    "delay_days": 0,
    "estimated_distance_km": "0.00",
    "week_number": 50,
    "year": 2025,
    "code": "ST001",
    "store_name": "Store Paris Centre",
    "contract_type": "COMEAU",
    "warehouse_location": "Paris, France"
  }
]
```

## 📊 Data Management Endpoints

### 6. Get Stores
**GET** `/get-stores`

Retrieve all active stores with contract information.

### 7. Get Warehouses
**GET** `/get-warehouses`

Retrieve all warehouses with capacity information.

### 8. Add Store
**POST** `/add-store`

Add a new store to the system.

**Request Body:**
```json
{
  "code": "ST016",
  "name": "Store New Location",
  "address": "123 Main St, City",
  "gps_lat": 48.8566,
  "gps_lng": 2.3522,
  "opening_hours": "08:00",
  "closing_hours": "21:00",
  "unloading_time_minutes": 30
}
```

### 9. Add Contract
**POST** `/add-contract`

Create a new delivery contract for a store.

**Request Body:**
```json
{
  "store_id": 1,
  "contract_type": "COMEAU",
  "frequency_per_week": 3,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```

## 🔧 System Endpoints

### 10. Health Check
**GET** `/test`

System health check endpoint.

**Response:**
```json
{
  "message": "Test endpoint working!"
}
```

## 📋 Contract Types

### COMEAU
- **Frequency**: 3 deliveries per week
- **Preferred Days**: Monday, Wednesday, Friday
- **Priority**: High frequency distribution

### COMDET
- **Frequency**: 1 delivery per week
- **Preferred Days**: Early in the week (Monday-Wednesday)
- **Priority**: Weekly distribution

## 🎯 Optimization Parameters

### Distance Constraints
- **Conservative**: 500km/day
- **Standard**: 600km/day (recommended)
- **Aggressive**: 800km/day
- **Maximum**: 1000km/day

### Performance Metrics
- **Execution Time**: < 0.1 seconds for 15 stores
- **Distance Accuracy**: GPS-based Haversine calculations
- **Contract Compliance**: 100% frequency adherence
- **Capacity Utilization**: 70-90% optimal range

## 🚀 Usage Examples

### Generate Weekly Schedule
```bash
curl -X POST http://localhost:3001/api/generate-schedule \
  -H "Content-Type: application/json" \
  -d '{"warehouse_id":1,"week_number":48,"year":2025,"max_daily_distance":600}'
```

### Export to CSV
```bash
curl -X POST http://localhost:3001/api/export-schedule \
  -H "Content-Type: application/json" \
  -d '{"week_number":48,"year":2025,"warehouse_id":1,"format":"csv"}' \
  --output schedule.csv
```

### Calculate Distances
```bash
curl -X POST http://localhost:3001/api/calculate-distances \
  -H "Content-Type: application/json" \
  -d '{"warehouse_id":1,"store_ids":[1,2,3,4,5]}'
```

## 📈 Response Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (missing parameters)
- **404**: Not Found
- **500**: Internal Server Error

## 🔒 Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error description",
  "details": "Additional error information"
}
```

---

**📚 Enhanced Planify API - Powering Intelligent Delivery Planning**
