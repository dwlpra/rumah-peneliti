#!/bin/bash
# ============================================================
#  RumahPeneliti — Local Setup Script
#  Jalankan: chmod +x scripts/local-setup.sh && ./scripts/local-setup.sh
# ============================================================

set -e

echo "🏛️  RumahPeneliti — Local Setup"
echo "================================"

# ── 1. Cek dependency ──
echo ""
echo "📦 Checking dependencies..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install: https://nodejs.org"
    exit 1
fi
echo "  ✅ Node.js $(node -v)"

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. You can run without Docker (see below)."
fi

# ── 2. Install dependencies ──
echo ""
echo "📦 Installing dependencies..."

cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo "  ✅ Dependencies installed"

# ── 3. Setup environment ──
echo ""
echo "🔧 Setting up environment..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "  ✅ backend/.env created (edit with your keys)"
else
    echo "  ✅ backend/.env already exists"
fi

# Frontend .env
if [ ! -f frontend/.env.local ]; then
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0xF5E23E98a6a93Db2c814a033929F68D5B74445E2
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
EOF
    echo "  ✅ frontend/.env.local created"
else
    echo "  ✅ frontend/.env.local already exists"
fi

# ── 4. Setup database ──
echo ""
echo "🗄️  Setting up database..."

DB_DIR="backend/data"
mkdir -p "$DB_DIR"

if [ -f "scripts/db-seed.sql" ]; then
    # Pakai node untuk import SQL
    node -e "
    const Database = require('better-sqlite3');
    const fs = require('fs');
    const db = new Database('$DB_DIR/rumahpeneliti.db');
    const sql = fs.readFileSync('scripts/db-seed.sql', 'utf8');
    db.exec(sql);
    console.log('  ✅ Database seeded');
    db.close();
    " 2>/dev/null || echo "  ⚠️  Run: node scripts/seed-db.js to seed database"
else
    echo "  ⚠️  No seed file found. Database will be created on first run."
fi

# ── 5. Build frontend ──
echo ""
echo "🔨 Building frontend..."
cd frontend && npm run build && cd ..
echo "  ✅ Frontend built"

# ── Done ──
echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "🚀 To run locally:"
echo ""
echo "  # Terminal 1 — Backend:"
echo "  cd backend && node src/index.js"
echo ""
echo "  # Terminal 2 — Frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "  Or with Docker:"
echo "  docker-compose up --build"
echo ""
echo "  📍 Frontend: http://localhost:3000"
echo "  📍 Backend:  http://localhost:3001"
echo "================================"
