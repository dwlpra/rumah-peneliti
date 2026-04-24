#!/bin/bash
# Run full E2E test from backend directory (where ethers is available)
cd "$(dirname "$0")/../backend"
node e2e/full-e2e.test.js
