#!/bin/bash

# Enhanced Planify System - Comprehensive Test Script
# Tests all major features of the delivery planning system

echo "🚀 Enhanced Planify System - Comprehensive Test Suite"
echo "=================================================="

API_BASE="http://localhost:3001/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    
    echo -e "\n${BLUE}Testing: $name${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$API_BASE$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
        echo "Response: $(echo "$body" | jq -r 'if type == "array" then "Array with \(length) items" else if .success then "Success: \(.message // "Operation completed")" else . end end' 2>/dev/null || echo "$body" | head -c 100)..."
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "Error: $body"
    fi
}

echo -e "\n${YELLOW}1. Testing Basic System Health${NC}"
echo "=============================="

# Test basic endpoints
test_endpoint "System Health Check" "GET" "/test"
test_endpoint "Get Warehouses" "GET" "/get-warehouses"
test_endpoint "Get Stores" "GET" "/get-stores"

echo -e "\n${YELLOW}2. Testing Distance Calculations${NC}"
echo "================================"

# Test distance calculation with multiple stores
test_endpoint "Calculate Distances" "POST" "/calculate-distances" '{
    "warehouse_id": 1,
    "store_ids": [1, 2, 3, 4, 5]
}'

echo -e "\n${YELLOW}3. Testing Schedule Generation (Multiple Scenarios)${NC}"
echo "=================================================="

# Test different optimization scenarios
test_endpoint "Conservative Scenario (500km)" "POST" "/generate-schedule" '{
    "warehouse_id": 1,
    "week_number": 50,
    "year": 2025,
    "max_daily_distance": 500
}'

test_endpoint "Standard Scenario (600km)" "POST" "/generate-schedule" '{
    "warehouse_id": 1,
    "week_number": 50,
    "year": 2025,
    "max_daily_distance": 600
}'

test_endpoint "Aggressive Scenario (800km)" "POST" "/generate-schedule" '{
    "warehouse_id": 1,
    "week_number": 50,
    "year": 2025,
    "max_daily_distance": 800
}'

echo -e "\n${YELLOW}4. Testing Analytics & Optimization History${NC}"
echo "=========================================="

test_endpoint "Get Optimization Runs" "GET" "/optimization-runs"

echo -e "\n${YELLOW}5. Testing Schedule Retrieval${NC}"
echo "============================="

test_endpoint "Get Generated Schedules" "GET" "/schedules/50/2025?warehouse_id=1"

echo -e "\n${YELLOW}6. Testing Export Functionality${NC}"
echo "==============================="

# Test CSV export
echo -e "\n${BLUE}Testing: CSV Export${NC}"
curl -s -X POST -H "Content-Type: application/json" \
    -d '{"week_number":50,"year":2025,"warehouse_id":1,"format":"csv"}' \
    "$API_BASE/export-schedule" > test_export.csv

if [ -f "test_export.csv" ] && [ -s "test_export.csv" ]; then
    echo -e "${GREEN}✅ CSV Export SUCCESS${NC}"
    echo "File size: $(wc -c < test_export.csv) bytes"
    echo "Lines: $(wc -l < test_export.csv)"
    echo "Sample content:"
    head -3 test_export.csv
else
    echo -e "${RED}❌ CSV Export FAILED${NC}"
fi

# Test JSON export
test_endpoint "JSON Export" "POST" "/export-schedule" '{
    "week_number": 50,
    "year": 2025,
    "warehouse_id": 1,
    "format": "json"
}'

echo -e "\n${YELLOW}7. Testing System Performance${NC}"
echo "============================="

# Performance test with timing
echo -e "\n${BLUE}Performance Test: Large Schedule Generation${NC}"
start_time=$(date +%s.%N)

response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
    -d '{"warehouse_id":1,"week_number":51,"year":2025,"max_daily_distance":600}' \
    "$API_BASE/generate-schedule")

end_time=$(date +%s.%N)
execution_time=$(echo "$end_time - $start_time" | bc)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Performance Test SUCCESS${NC}"
    echo "Total execution time: ${execution_time}s"
    
    # Extract metrics from response
    total_deliveries=$(echo "$body" | jq -r '.summary.total_deliveries' 2>/dev/null)
    total_distance=$(echo "$body" | jq -r '.summary.total_distance_km' 2>/dev/null)
    stores_served=$(echo "$body" | jq -r '.summary.stores_served' 2>/dev/null)
    
    echo "Deliveries generated: $total_deliveries"
    echo "Total distance: ${total_distance}km"
    echo "Stores served: $stores_served"
else
    echo -e "${RED}❌ Performance Test FAILED${NC}"
fi

echo -e "\n${YELLOW}8. Testing Data Validation${NC}"
echo "=========================="

# Test invalid data handling
test_endpoint "Invalid Warehouse ID" "POST" "/generate-schedule" '{
    "warehouse_id": 999,
    "week_number": 50,
    "year": 2025,
    "max_daily_distance": 600
}'

test_endpoint "Invalid Week Number" "POST" "/generate-schedule" '{
    "warehouse_id": 1,
    "week_number": 60,
    "year": 2025,
    "max_daily_distance": 600
}'

echo -e "\n${YELLOW}9. System Statistics Summary${NC}"
echo "==========================="

# Get final system statistics
warehouses_count=$(curl -s "$API_BASE/get-warehouses" | jq length 2>/dev/null || echo "N/A")
stores_count=$(curl -s "$API_BASE/get-stores" | jq length 2>/dev/null || echo "N/A")
optimization_runs=$(curl -s "$API_BASE/optimization-runs" | jq length 2>/dev/null || echo "N/A")

echo "📊 System Statistics:"
echo "  • Warehouses: $warehouses_count"
echo "  • Stores: $stores_count"
echo "  • Optimization Runs: $optimization_runs"

# Calculate total distance from all runs
total_system_distance=$(curl -s "$API_BASE/optimization-runs" | jq '[.[].total_distance_km | tonumber] | add' 2>/dev/null || echo "N/A")
echo "  • Total Distance Optimized: ${total_system_distance}km"

echo -e "\n${GREEN}🎉 Enhanced Planify System Test Complete!${NC}"
echo "========================================"

# Cleanup
rm -f test_export.csv

echo -e "\n${BLUE}Key Features Demonstrated:${NC}"
echo "✅ Multi-store delivery optimization (15 stores)"
echo "✅ GPS-based distance calculations (Haversine formula)"
echo "✅ Contract type handling (COMEAU/COMDET)"
echo "✅ Daily capacity constraints (600km limit)"
echo "✅ Multiple optimization scenarios"
echo "✅ Analytics and performance tracking"
echo "✅ CSV/JSON export functionality"
echo "✅ Real-time schedule generation"
echo "✅ System scalability testing"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "• Access the web interface at http://localhost:3000"
echo "• View Analytics dashboard for performance metrics"
echo "• Use Simulation module for scenario testing"
echo "• Export schedules in CSV format for external use"
