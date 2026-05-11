#!/bin/bash
# ============================================================
# RumahPeneliti Deployment Script
# Usage: ./deploy.sh [service]
#   ./deploy.sh          → deploy all services
#   ./deploy.sh backend  → deploy backend only
#   ./deploy.sh frontend → deploy frontend only
#   ./deploy.sh indexer  → deploy indexer only
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${CYAN}🔮 RumahPeneliti Deploy${NC}"
echo "================================"

# Step 1: Git pull
echo -e "\n${YELLOW}[1/5] Pulling latest code...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"

# Step 2: Determine what to build
SERVICE="${1:-all}"
if [ "$SERVICE" = "all" ]; then
  SERVICES="backend frontend indexer"
else
  SERVICES="$SERVICE"
fi

# Step 3: Stop conflicting PM2 processes (safety check)
echo -e "\n${YELLOW}[2/5] Checking for port conflicts...${NC}"
for proc in rp-backend rp-frontend; do
  if pm2 describe "$proc" &>/dev/null; then
    echo -e "  Stopping PM2 $proc (conflicts with Docker)..."
    pm2 stop "$proc" &>/dev/null && pm2 delete "$proc" &>/dev/null || true
  fi
done
# Kill any process on our ports that isn't Docker
for port in 3000 3001 42069; do
  pid=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -v docker | grep -oP 'pid=\K[0-9]+' | head -1)
  if [ -n "$pid" ]; then
    echo -e "  Killing non-Docker process $pid on port $port..."
    kill "$pid" 2>/dev/null || true
  fi
done
echo -e "${GREEN}✓ No port conflicts${NC}"

# Step 4: Build
echo -e "\n${YELLOW}[3/5] Building Docker images...${NC}"
export NEXT_PUBLIC_API_URL="https://api.rumahpeneliti.com"

for svc in $SERVICES; do
  echo -e "  Building ${CYAN}$svc${NC}..."
  docker-compose build --no-cache "$svc" 2>&1 | tail -3
  echo -e "  ${GREEN}✓ $svc built${NC}"
done

# Step 5: Recreate containers
echo -e "\n${YELLOW}[4/5] Deploying containers...${NC}"
for svc in $SERVICES; do
  container="rumahpeneliti_${svc}_1"
  docker stop "$container" 2>/dev/null || true
  docker rm "$container" 2>/dev/null || true
done

docker-compose up -d $SERVICES 2>&1 | grep -E "Creating|done|error" || true
echo -e "${GREEN}✓ Containers started${NC}"

# Step 6: Health check
echo -e "\n${YELLOW}[5/5] Health check...${NC}"
sleep 5

check_service() {
  local name=$1
  local url=$2
  local expected=$3
  
  response=$(curl -s --max-time 10 "$url" 2>/dev/null || echo "FAILED")
  if echo "$response" | grep -q "$expected"; then
    echo -e "  ${GREEN}✓ $name${NC} — OK"
  else
    echo -e "  ${RED}✗ $name${NC} — FAILED (check logs: docker logs rumahpeneliti_${name}_1)"
  fi
}

# Check backend
check_service "backend" "https://api.rumahpeneliti.com/api/health" '"status":"ok"'

# Check frontend  
check_service "frontend" "https://rumahpeneliti.com" "RumahPeneliti"

# Check indexer (internal only)
indexer_response=$(curl -s --max-time 5 http://localhost:42069/graphql \
  -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ paperAnchorEventss { totalCount } }"}' 2>/dev/null || echo "FAILED")
if echo "$indexer_response" | grep -q "totalCount"; then
  echo -e "  ${GREEN}✓ indexer${NC} — OK"
else
  echo -e "  ${RED}✗ indexer${NC} — FAILED"
fi

# Show sync logs for backend
echo -e "\n${CYAN}--- Backend sync logs ---${NC}"
docker logs rumahpeneliti_backend_1 2>&1 | grep "\[Sync\]" | tail -5 || true

# Show running containers
echo -e "\n${CYAN}--- Running services ---${NC}"
docker ps --filter "name=rumahpeneliti" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true

echo -e "\n${GREEN}🔮 Deploy complete!${NC}"
echo -e "Frontend: https://rumahpeneliti.com"
echo -e "Backend:  https://api.rumahpeneliti.com/api/health"
echo -e "Indexer:  http://localhost:42069/graphql (internal)"
