#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  RumahPeneliti — One-Command Setup & Run
#
#  Usage:
#    bash scripts/setup.sh          # full setup + run
#    bash scripts/setup.sh --setup  # setup only (no run)
#    bash scripts/setup.sh --run    # run only (skip setup)
# ============================================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Colors
BLUE='\033[1;34m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
CYAN='\033[1;36m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

# Flags
SETUP=true
RUN=true
case "${1:-}" in
  --setup) RUN=false ;;
  --run)   SETUP=false ;;
esac

# ── Helpers ──
step()   { echo "\n${BLUE}▸ $1${RESET}"; }
ok()     { echo "  ${GREEN}✔ $1${RESET}"; }
warn()   { echo "  ${YELLOW}⚠ $1${RESET}"; }
die()    { echo "\n  ${RED}✖ $1${RESET}\n"; exit 1; }

# ============================================================
#  SETUP
# ============================================================
if [ "$SETUP" = true ]; then

echo ""
echo "${CYAN}══════════════════════════════════════════════${RESET}"
echo "${CYAN}  RumahPeneliti — Local Setup${RESET}"
echo "${CYAN}══════════════════════════════════════════════${RESET}"

# ── 1. Prerequisites ──
step "Checking prerequisites..."
if ! command -v node &>/dev/null; then
  die "Node.js is not installed. Install from https://nodejs.org (v18+ required)"
fi
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  die "Node.js v18+ required (found v$(node -v))"
fi
ok "Node.js $(node -v), npm $(npm -v)"

# ── 2. Install dependencies ──
step "Installing dependencies..."
cd "$BACKEND_DIR" && npm install --silent 2>/dev/null
ok "Backend dependencies installed"
cd "$FRONTEND_DIR" && npm install --silent 2>/dev/null
ok "Frontend dependencies installed"
cd "$ROOT_DIR/indexer" && npm install --silent 2>/dev/null
ok "Indexer dependencies installed"

# ── 3. Environment files ──
step "Configuring environment..."
if [ ! -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  ok "Created .env from .env.example"
else
  ok ".env already exists"
fi

if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
  cat > "$FRONTEND_DIR/.env.local" << 'ENVEOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0xF5E23E98a6a93Db2c814a033929F68D5B74445E2
NEXT_PUBLIC_CHAIN_RPC=https://evmrpc.0g.ai
NEXT_PUBLIC_CHAIN_ID=16661
ENVEOF
  ok "Created frontend/.env.local"
else
  ok "frontend/.env.local already exists"
fi

# ── 4. Database ──
step "Setting up database..."
mkdir -p "$BACKEND_DIR/data"
if [ ! -f "$BACKEND_DIR/data/rumahpeneliti.db" ]; then
  if [ -f "$ROOT_DIR/scripts/rumahpeneliti.db" ]; then
    cp "$ROOT_DIR/scripts/rumahpeneliti.db" "$BACKEND_DIR/data/rumahpeneliti.db"
    ok "Database copied (pre-built with demo data)"
  else
    warn "Pre-built DB not found — will auto-seed on first backend start"
  fi
else
  ok "Database already exists"
fi

# ── 5. Summary ──
echo ""
echo "${GREEN}══════════════════════════════════════════════${RESET}"
echo "${GREEN}  Setup complete!${RESET}"
echo "${GREEN}══════════════════════════════════════════════${RESET}"

# Check for optional keys
if grep -q "your_zai_api_key_here" "$ROOT_DIR/.env" 2>/dev/null; then
  echo ""
  warn "LLM_API_KEY not set — AI curation features won't work"
  echo "  ${DIM}Edit .env and add your Z.AI API key${RESET}"
fi
if grep -q "your_wallet_private_key_here" "$ROOT_DIR/.env" 2>/dev/null; then
  warn "PRIVATE_KEY not set — on-chain features won't work"
  echo "  ${DIM}Edit .env and add your wallet private key${RESET}"
fi
echo ""

if [ "$RUN" = false ]; then
  echo "Run ${BOLD}bash scripts/setup.sh --run${RESET} to start the servers."
  exit 0
fi

fi # end SETUP

# ============================================================
#  RUN
# ============================================================
if [ "$RUN" = true ]; then

echo ""
echo "${CYAN}══════════════════════════════════════════════${RESET}"
echo "${CYAN}  Starting RumahPeneliti...${RESET}"
echo "${CYAN}══════════════════════════════════════════════${RESET}"
echo ""

# Cleanup function
cleanup() {
  echo ""
  echo "${YELLOW}Stopping servers...${RESET}"
  kill $(jobs -p) 2>/dev/null 2>/dev/null || true
  wait 2>/dev/null
  echo "${GREEN}Stopped.${RESET}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend
cd "$BACKEND_DIR"
node src/index.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo "${DIM}Waiting for backend...${RESET}"
for i in $(seq 1 15); do
  if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
  echo "${GREEN}  ✔ Backend running on http://localhost:3001${RESET}"
else
  echo "${RED}  ✖ Backend failed to start${RESET}"
fi

# Start frontend
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Start indexer (Ponder)
cd "$ROOT_DIR/indexer"
npm run dev &
INDEXER_PID=$!

# Wait for frontend and detect port
echo "${DIM}Waiting for frontend...${RESET}"
FRONTEND_PORT=""
for i in $(seq 1 30); do
  # Check common ports
  for PORT in 3000 3001 3002 3003; do
    if curl -s -o /dev/null http://localhost:$PORT >/dev/null 2>&1; then
      # Verify it's Next.js, not the backend
      RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null)
      if [ "$RESPONSE" = "200" ] && [ "$PORT" != "3001" ]; then
        FRONTEND_PORT=$PORT
        break 2
      fi
    fi
  done
  sleep 1
done

if [ -n "$FRONTEND_PORT" ]; then
  echo "${GREEN}  ✔ Frontend running on http://localhost:$FRONTEND_PORT${RESET}"
else
  warn "Could not detect frontend port — check terminal output"
fi

echo ""
echo "${BOLD}══════════════════════════════════════════════${RESET}"
echo "${BOLD}  RumahPeneliti is running!${RESET}"
echo "${BOLD}══════════════════════════════════════════════${RESET}"
echo ""
echo "  ${CYAN}Frontend:${RESET}  http://localhost:${FRONTEND_PORT:-3000}"
echo "  ${CYAN}Backend:${RESET}   http://localhost:3001"
echo "  ${CYAN}API Health:${RESET} http://localhost:3001/api/health"
echo ""
echo "  ${DIM}Press Ctrl+C to stop${RESET}"
echo ""

# Keep script alive
wait

fi
