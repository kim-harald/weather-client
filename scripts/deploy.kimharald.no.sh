#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEST_DIR="/mnt/net/kimharald.no/www/weather-client"

echo "Deploying weather-client to kimharald.no..."

# Build production
cd "$PROJECT_DIR"
npm run build:prod

# Check if destination is mounted
if [ ! -d "$DEST_DIR" ]; then
    echo "Error: $DEST_DIR is not accessible. Is the network share mounted?"
    exit 1
fi

# Clean destination
rm -rf "${DEST_DIR:?}"/*

# Copy built files
cp -r "$PROJECT_DIR/dist/browser/"* "$DEST_DIR/"

echo "Deployment to kimharald.no complete!"
