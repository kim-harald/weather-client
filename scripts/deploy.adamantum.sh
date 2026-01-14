#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEST_DIR="/home/kim/www/weather-client"

echo "Deploying weather-client to adamantum..."

# Build production
cd "$PROJECT_DIR"
npm run build:prod

# Clean destination
rm -rf "${DEST_DIR:?}"/*

# Copy built files
cp -r "$PROJECT_DIR/dist/browser/"* "$DEST_DIR/"

echo "Deployment to adamantum complete!"
echo "Site available at: https://localhost"
