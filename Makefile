# ============================================================
#  RumahPeneliti — Makefile
# ============================================================
#
#  Cara pakai:
#    make help          — Tampilkan semua command
#    make dev           — Jalankan backend + frontend (local dev)
#    make docker-up     — Build & jalankan Docker containers
#    make test          — Jalankan E2E tests
#    make push          — Git add, commit, push
#
# ============================================================

# ── Config ──
BACKEND_DIR  = backend
FRONTEND_DIR = frontend
REPO         = git@github.com:dwlpra/rumah-peneliti.git
PORT_BACKEND = 3001
PORT_FRONTEND = 3000

# ── Colors ──
BLUE   = \033[1;34m
GREEN  = \033[1;32m
YELLOW = \033[1;33m
CYAN   = \033[1;36m
RESET  = \033[0m

.PHONY: help install dev dev-backend dev-frontend \
        docker-up docker-down docker-build docker-logs docker-restart \
        test test-auth test-e2e test-api \
        db-seed db-reset \
        git-status git-push git-log \
        clean

# ============================================================
#  HELP
# ============================================================

help: ## 📋 Tampilkan semua command yang tersedia
	@echo ""
	@echo "$(CYAN)══════════════════════════════════════════════$(RESET)"
	@echo "$(CYAN)  RumahPeneliti — Command Reference$(RESET)"
	@echo "$(CYAN)══════════════════════════════════════════════$(RESET)"
	@echo ""
	@echo "$(BLUE)Development:$(RESET)"
	@echo "  make install         — 📦 Install semua dependencies"
	@echo "  make dev             — 🚀 Jalankan backend + frontend (local)"
	@echo "  make dev-backend     — 🔧 Jalankan backend saja (port $(PORT_BACKEND))"
	@echo "  make dev-frontend    — 🎨 Jalankan frontend saja (port $(PORT_FRONTEND))"
	@echo ""
	@echo "$(BLUE)Docker:$(RESET)"
	@echo "  make docker-up       — 🐳 Build + jalankan semua containers"
	@echo "  make docker-down     — 🛑 Stop semua containers"
	@echo "  make docker-build    — 🔨 Build ulang containers (tanpa start)"
	@echo "  make docker-logs     — 📋 Tampilkan logs (tail -f)"
	@echo "  make docker-restart  — 🔄 Restart containers"
	@echo ""
	@echo "$(BLUE)Testing:$(RESET)"
	@echo "  make test            — ✅ Jalankan semua E2E tests"
	@echo "  make test-auth       — 🔐 Test auth flow saja (24 tests)"
	@echo "  make test-e2e        — 🧪 Test full E2E (77 tests)"
	@echo "  make test-api        — 🌐 Test API endpoints saja"
	@echo ""
	@echo "$(BLUE)Database:$(RESET)"
	@echo "  make db-seed         — 🌱 Reset DB dengan demo data"
	@echo "  make db-reset        — 🗑️  Hapus DB + buat ulang"
	@echo ""
	@echo "$(BLUE)Git:$(RESET)"
	@echo "  make git-status      — 📊 Status repo"
	@echo "  make git-push        — 📤 Add + commit + push"
	@echo "  make git-log         — 📜 Log commit terakhir"
	@echo ""
	@echo "$(BLUE)Utilities:$(RESET)"
	@echo "  make clean           — 🧹 Hapus node_modules, .next, cache"
	@echo ""

# ============================================================
#  INSTALL
# ============================================================

install: ## 📦 Install semua dependencies
	@echo "$(GREEN)📦 Installing backend...$(RESET)"
	cd $(BACKEND_DIR) && npm install
	@echo "$(GREEN)📦 Installing frontend...$(RESET)"
	cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✅ Done!$(RESET)"

# ============================================================
#  DEVELOPMENT (Local)
# ============================================================

dev: ## 🚀 Jalankan backend + frontend (local dev)
	@echo "$(GREEN)🚀 Starting RumahPeneliti (dev mode)...$(RESET)"
	@echo "$(YELLOW)   Backend:  http://localhost:$(PORT_BACKEND)$(RESET)"
	@echo "$(YELLOW)   Frontend: http://localhost:$(PORT_FRONTEND)$(RESET)"
	@make -j2 dev-backend dev-frontend

dev-backend: ## 🔧 Jalankan backend saja
	@echo "$(GREEN)🔧 Starting backend on port $(PORT_BACKEND)...$(RESET)"
	cd $(BACKEND_DIR) && node src/index.js

dev-frontend: ## 🎨 Jalankan frontend saja
	@echo "$(GREEN)🎨 Starting frontend on port $(PORT_FRONTEND)...$(RESET)"
	cd $(FRONTEND_DIR) && npm run dev

# ============================================================
#  DOCKER
# ============================================================

docker-up: ## 🐳 Build + jalankan semua containers
	@echo "$(GREEN)🐳 Building & starting containers...$(RESET)"
	@# Build backend
	cd $(BACKEND_DIR) && docker build -t rp-backend .
	@# Build frontend
	cd $(FRONTEND_DIR) && docker build -t rp-frontend .
	@# Stop old containers (kalau ada)
	-docker rm -f rp-backend rp-frontend 2>/dev/null
	@# Start backend (network host untuk akses Ponder)
	docker run -d --name rp-backend --network host \
		--restart unless-stopped --env-file .env rp-backend
	@# Start frontend
	docker run -d --name rp-frontend -p $(PORT_FRONTEND):$(PORT_FRONTEND) \
		--restart unless-stopped rp-frontend
	@echo "$(GREEN)✅ Containers running!$(RESET)"
	@echo "$(YELLOW)   Frontend: http://localhost:$(PORT_FRONTEND)$(RESET)"
	@echo "$(YELLOW)   Backend:  http://localhost:$(PORT_BACKEND)$(RESET)"

docker-down: ## 🛑 Stop semua containers
	@echo "$(YELLOW)🛑 Stopping containers...$(RESET)"
	docker rm -f rp-backend rp-frontend 2>/dev/null || true
	@echo "$(GREEN)✅ Containers stopped$(RESET)"

docker-build: ## 🔨 Build ulang containers
	@echo "$(GREEN)🔨 Rebuilding containers...$(RESET)"
	cd $(BACKEND_DIR) && docker build -t rp-backend .
	cd $(FRONTEND_DIR) && docker build -t rp-frontend .
	@echo "$(GREEN)✅ Build complete. Run 'make docker-up' to start.$(RESET)"

docker-logs: ## 📋 Tampilkan container logs
	@echo "$(CYAN)Backend logs (Ctrl+C to exit):$(RESET)"
	docker logs -f rp-backend

docker-restart: ## 🔄 Restart containers
	@echo "$(YELLOW)🔄 Restarting...$(RESET)"
	docker restart rp-backend rp-frontend
	@echo "$(GREEN)✅ Restarted$(RESET)"

# ============================================================
#  TESTING
# ============================================================

test: test-auth test-e2e ## ✅ Jalankan semua tests
	@echo ""
	@echo "$(GREEN)════════════════════════════════════════$(RESET)"
	@echo "$(GREEN)  ALL TESTS COMPLETE$(RESET)"
	@echo "$(GREEN)════════════════════════════════════════$(RESET)"

test-auth: ## 🔐 Test auth flow (24 tests)
	@echo "$(CYAN)🔐 Running auth flow tests...$(RESET)"
	cd $(BACKEND_DIR) && node e2e/auth-flow.test.js

test-e2e: ## 🧪 Test full E2E (77 tests)
	@echo "$(CYAN)🧪 Running full E2E tests...$(RESET)"
	cd $(BACKEND_DIR) && node e2e/full-e2e.test.js

test-api: ## 🌐 Quick API health check
	@echo "$(CYAN)🌐 Testing API endpoints...$(RESET)"
	@curl -s http://localhost:$(PORT_BACKEND)/api/health | python3 -m json.tool 2>/dev/null || \
		echo "$(YELLOW)⚠️  Backend not running? Start with: make dev-backend$(RESET)"

# ============================================================
#  DATABASE
# ============================================================

db-seed: ## 🌱 Reset DB dengan demo data
	@echo "$(GREEN)🌱 Resetting database with demo data...$(RESET)"
	rm -f $(BACKEND_DIR)/data/rumahpeneliti.db
	@echo "$(GREEN)✅ DB reset. Demo data akan auto-seed saat backend start.$(RESET)"

db-reset: ## 🗑️ Hapus DB + buat ulang
	@echo "$(YELLOW)🗑️  Deleting database...$(RESET)"
	rm -f $(BACKEND_DIR)/data/rumahpeneliti.db
	@echo "$(GREEN)✅ Database deleted. Will recreate on next backend start.$(RESET)"

# ============================================================
#  GIT
# ============================================================

git-status: ## 📊 Status repo
	@echo "$(CYAN)📊 Git Status:$(RESET)"
	@git status --short
	@echo ""
	@echo "$(CYAN)Last 5 commits:$(RESET)"
	@git log --oneline -5

git-push: ## 📤 Add + commit + push (butuh MSG= pesan)
	@if [ -z "$(MSG)" ]; then \
		echo "$(YELLOW)⚠️  Usage: make git-push MSG=\"commit message\"$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)📦 Committing...$(RESET)"
	git add -A
	git commit -m "$(MSG)"
	git push origin main
	@echo "$(GREEN)✅ Pushed!$(RESET)"

git-log: ## 📜 Log commit terakhir
	@git log --oneline -10 --decorate --graph

# ============================================================
#  CLEANUP
# ============================================================

clean: ## 🧹 Hapus node_modules, .next, cache
	@echo "$(YELLOW)🧹 Cleaning...$(RESET)"
	rm -rf $(BACKEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/.next
	rm -rf $(BACKEND_DIR)/data/*.db
	@echo "$(GREEN)✅ Clean! Run 'make install' to reinstall.$(RESET)"
