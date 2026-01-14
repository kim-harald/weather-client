#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEST_DIR="/mnt/net/kimharald.no/www/weather-client"

echo "Deploying weather-client to kimharald.no..."

# Clean destination
rm -rf "${DEST_DIR:?}"/*

# Copy built files
cp -r "$PROJECT_DIR/dist/browser/"* "$DEST_DIR/"

echo "Deployment to kimharald.no complete!"