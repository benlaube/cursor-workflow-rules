#!/bin/bash

###############################################################################
# Documentation Interface Launcher
# 
# This script launches the documentation interface test environment.
# 
# Usage:
#   ./launch-docs.sh                    # Launch on default port (3000), prompts for background mode
#   ./launch-docs.sh --background       # Launch in background (skip prompt)
#   ./launch-docs.sh --debug            # Enable debug/verbose mode
#   PORT=8080 ./launch-docs.sh          # Launch on custom port, prompts for background mode
#   ./launch-docs.sh --port 8080        # Launch on custom port (alternative)
#
# Dependencies:
#   - Node.js (v18+)
#   - npm
#   - Self-contained module directory
###############################################################################

# Note: We don't use 'set -e' because we want to handle errors explicitly
# and ensure the background prompt always appears

# Debug mode flag
DEBUG=false

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging functions (must be defined before use)
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$SCRIPT_DIR"
URL_PATH="/docs"  # Default URL path

# Verify module is self-contained
if [ ! -f "$APP_DIR/package.json" ] || [ ! -d "$APP_DIR/app" ] || ! grep -q '"next"' "$APP_DIR/package.json" 2>/dev/null; then
  log_error "Module is not properly configured. Missing Next.js setup."
  log_error "Please ensure package.json includes Next.js and app/ directory exists."
  exit 1
fi

log_info "Using self-contained module directory"

# Read configuration from package.json if available
read_package_config() {
    local pkg_file="$APP_DIR/package.json"
    
    if [ -f "$pkg_file" ]; then
        # Try using jq if available (most reliable)
        if command -v jq &> /dev/null; then
            local pkg_port=$(jq -r '.docsInterface.port // 3000' "$pkg_file" 2>/dev/null)
            local pkg_path=$(jq -r '.docsInterface.urlPath // "/docs"' "$pkg_file" 2>/dev/null)
            
            if [ "$pkg_port" != "null" ] && [ -n "$pkg_port" ]; then
                PORT=${PORT:-$pkg_port}
            fi
            
            if [ "$pkg_path" != "null" ] && [ -n "$pkg_path" ]; then
                URL_PATH=$pkg_path
            fi
        # Fallback to grep/sed if jq not available
        elif grep -q '"docsInterface"' "$pkg_file" 2>/dev/null; then
            local pkg_port=$(grep -A 2 '"docsInterface"' "$pkg_file" | grep '"port"' | sed 's/.*"port"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/' | head -1)
            local pkg_path=$(grep -A 2 '"docsInterface"' "$pkg_file" | grep '"urlPath"' | sed 's/.*"urlPath"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | head -1)
            
            if [ -n "$pkg_port" ] && [ "$pkg_port" != "" ]; then
                PORT=${PORT:-$pkg_port}
            fi
            
            if [ -n "$pkg_path" ] && [ "$pkg_path" != "" ]; then
                URL_PATH=$pkg_path
            fi
        fi
    fi
    
    # Final fallback to defaults
    PORT=${PORT:-3000}
    URL_PATH=${URL_PATH:-/docs}
}

# Initialize configuration
read_package_config

check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_warning "Node.js version is ${NODE_VERSION}. Recommended: v18 or higher."
    else
        log_success "Node.js version: $(node -v)"
    fi
}

check_npm() {
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed."
        exit 1
    fi
    log_success "npm version: $(npm -v)"
}

check_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        log_warning "Port $PORT is already in use."
        read -p "Do you want to kill the process using port $PORT? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "Killing process on port $PORT..."
            lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
            sleep 1
            log_success "Port $PORT is now available."
        else
            log_error "Cannot start - port $PORT is in use."
            exit 1
        fi
    else
        log_success "Port $PORT is available."
    fi
}

install_dependencies() {
    if [ ! -d "$APP_DIR/node_modules" ]; then
        log_info "Installing dependencies in: $APP_DIR"
        log_info "This may take a minute..."
        cd "$APP_DIR" || {
            log_error "Failed to change to app directory: $APP_DIR"
            exit 1
        }
        if [ "$DEBUG" == "true" ]; then
            log_info "DEBUG: Running npm install with verbose output..."
            log_info "DEBUG: Using --no-workspaces to ignore parent workspace configuration"
            log_info "DEBUG: This ensures isolated installation without workspace dependency conflicts"
            if ! npm install --no-workspaces; then
                log_error "Failed to install dependencies. Check the output above for errors."
                exit 1
            fi
        else
            if ! npm install --no-workspaces --silent; then
                log_error "Failed to install dependencies. Check the output above for errors."
                log_info "Tip: Run with --debug to see detailed error messages"
                exit 1
            fi
        fi
        log_success "Dependencies installed in $APP_DIR/node_modules"
    else
        log_success "Dependencies already installed in $APP_DIR/node_modules"
        if [ "$DEBUG" == "true" ]; then
            log_info "DEBUG: node_modules directory exists at $APP_DIR/node_modules"
        fi
    fi
}

create_docs_folder() {
    # Use parent directory of module for docs folder
    DOCS_DIR="$SCRIPT_DIR/../docs"
    if [ ! -d "$DOCS_DIR" ]; then
        log_warning "No /docs folder found. Creating sample documentation..."
        mkdir -p "$DOCS_DIR"
        cat > "$DOCS_DIR/README.md" << 'EOF'
---
title: Documentation Home
description: Welcome to the documentation
created: 2025-12-01
lastUpdated: 2025-12-01
version: 1.0
---

# Documentation Home

Welcome to the documentation interface!

## Getting Started

This is a sample documentation file. You can:

- Edit this file using the interface
- Create new documentation files
- Search across all documentation
- View version history (if git is enabled)

## Features

- **Markdown Support**: Full GitHub Flavored Markdown
- **Syntax Highlighting**: Code blocks with syntax highlighting
- **Live Preview**: See changes as you type
- **Version Control**: Automatic git commits on save

## Next Steps

1. Explore the interface
2. Create new documentation files
3. Edit existing files
4. Search for content
EOF
        log_success "Created sample documentation in /docs"
    else
        log_success "Found existing /docs folder."
    fi
}

check_git() {
    if git rev-parse --git-dir > /dev/null 2>&1; then
        log_success "Git repository detected - version history enabled."
    else
        log_warning "Not a git repository - version history will be disabled."
        log_info "To enable version history, run: git init"
    fi
}

open_browser() {
    local url="http://localhost:$PORT$URL_PATH"
    
    # Wait a moment for server to start
    sleep 2
    
    # Detect OS and open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$url" 2>/dev/null && log_success "Opened browser to $url"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open "$url" 2>/dev/null && log_success "Opened browser to $url"
        elif command -v gnome-open &> /dev/null; then
            gnome-open "$url" 2>/dev/null && log_success "Opened browser to $url"
        else
            log_warning "Could not auto-open browser. Please open: $url"
        fi
    else
        log_info "Please open: $url"
    fi
}

start_server() {
    local url="http://localhost:$PORT$URL_PATH"
    log_info "Starting documentation interface on $url"
    log_info "Press Ctrl+C to stop the server."
    echo
    
    if [ "$DEBUG" == "true" ]; then
        log_info "DEBUG: Changing to directory: $APP_DIR"
    fi
    
    cd "$APP_DIR" || {
        log_error "Failed to change to app directory: $APP_DIR"
        exit 1
    }
    
    # Export PORT for Next.js
    export PORT=$PORT
    
    if [ "$DEBUG" == "true" ]; then
        log_info "DEBUG: PORT environment variable set to: $PORT"
        log_info "DEBUG: Current directory: $(pwd)"
        log_info "DEBUG: PATH includes: $APP_DIR/node_modules/.bin"
    fi
    
    # Ensure PATH includes node_modules/.bin for background processes
    export PATH="$APP_DIR/node_modules/.bin:$PATH"
    
    if [ "$1" == "--background" ]; then
        if [ "$DEBUG" == "true" ]; then
            log_info "DEBUG: Starting server in background mode"
        fi
        # Start server in background using a subshell to ensure proper environment
        # Use node to run next directly (most reliable method)
        (
            cd "$APP_DIR" || exit 1
            export PORT=$PORT
            
            if [ "$DEBUG" == "true" ]; then
                echo "DEBUG: Inside background subshell, PORT=$PORT, PWD=$(pwd)"
            fi
            
            # Use node to run next directly - this always works
            if [ -f "$APP_DIR/node_modules/next/dist/bin/next" ]; then
                if [ "$DEBUG" == "true" ]; then
                    echo "DEBUG: Using: node $APP_DIR/node_modules/next/dist/bin/next dev"
                fi
                node "$APP_DIR/node_modules/next/dist/bin/next" dev
            elif [ -f "$APP_DIR/node_modules/.bin/next" ]; then
                node "$APP_DIR/node_modules/.bin/next" dev
            elif command -v npx &> /dev/null; then
                npx next dev
            else
                # Last resort: use npm run but ensure PATH is set
                export PATH="$APP_DIR/node_modules/.bin:$PATH"
                npm run dev
            fi
        ) > /tmp/docs-interface.log 2>&1 &
        PID=$!
        echo $PID > /tmp/docs-interface.pid
        log_success "Server started in background (PID: $PID)"
        log_info "View logs: tail -f /tmp/docs-interface.log"
        log_info "Stop server: kill $(cat /tmp/docs-interface.pid)"
        log_info "URL: $url"
        # Open browser in background
        (sleep 3 && open_browser) &
        # Give a moment to verify server started
        sleep 2
        if ! kill -0 $PID 2>/dev/null; then
            log_error "Server process died immediately. Check logs: tail -f /tmp/docs-interface.log"
            log_error "Last 10 lines of log:"
            tail -10 /tmp/docs-interface.log 2>/dev/null || echo "Log file not found"
            exit 1
        else
            log_success "Server is running (PID: $PID)"
        fi
    else
        if [ "$DEBUG" == "true" ]; then
            log_info "DEBUG: Starting server in foreground mode"
        fi
        # Start server in background for foreground mode (so we can open browser)
        (
            cd "$APP_DIR" || exit 1
            export PORT=$PORT
            
            if [ "$DEBUG" == "true" ]; then
                echo "DEBUG: Inside foreground subshell, PORT=$PORT, PWD=$(pwd)"
            fi
            
            # Use node to run next directly - this always works
            if [ -f "$APP_DIR/node_modules/next/dist/bin/next" ]; then
                if [ "$DEBUG" == "true" ]; then
                    echo "DEBUG: Using: node $APP_DIR/node_modules/next/dist/bin/next dev"
                fi
                node "$APP_DIR/node_modules/next/dist/bin/next" dev
            elif [ -f "$APP_DIR/node_modules/.bin/next" ]; then
                if [ "$DEBUG" == "true" ]; then
                    echo "DEBUG: Using: node $APP_DIR/node_modules/.bin/next dev"
                fi
                node "$APP_DIR/node_modules/.bin/next" dev
            elif command -v npx &> /dev/null; then
                if [ "$DEBUG" == "true" ]; then
                    echo "DEBUG: Using: npx next dev"
                fi
                npx next dev
            else
                # Last resort: use npm run but ensure PATH is set
                export PATH="$APP_DIR/node_modules/.bin:$PATH"
                if [ "$DEBUG" == "true" ]; then
                    echo "DEBUG: Using: npm run dev"
                fi
                npm run dev
            fi
        ) > /tmp/docs-interface.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > /tmp/docs-interface.pid
        
        if [ "$DEBUG" == "true" ]; then
            log_info "DEBUG: Server PID: $SERVER_PID"
            log_info "DEBUG: Log file: /tmp/docs-interface.log"
        fi
        
        # Open browser after a short delay
        (sleep 3 && open_browser) &
        
        # Show logs and wait for server
        log_info "Server starting... (logs: tail -f /tmp/docs-interface.log)"
        log_info "Browser will open automatically in a few seconds."
        if [ "$DEBUG" == "true" ]; then
            log_info "DEBUG: Waiting for server process $SERVER_PID..."
        fi
        wait $SERVER_PID
    fi
}

# Parse command line arguments
BACKGROUND=false
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --port)
                PORT="$2"
                shift 2
                ;;
            --background)
                BACKGROUND=true
                shift
                ;;
            --debug|-d|--verbose|-v)
                DEBUG=true
                shift
                ;;
            *)
                log_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
}

# Prompt for background mode if not specified
prompt_background_mode() {
    if [ "$BACKGROUND" != "true" ]; then
        echo
        read -p "Run server in background? (y/n) [n]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            BACKGROUND=true
        fi
    fi
}

# Main execution
main() {
    parse_args "$@"
    
    # Enable bash debug mode if DEBUG flag is set
    if [ "$DEBUG" == "true" ]; then
        set -x  # Print commands and their arguments as they are executed
        log_info "DEBUG MODE ENABLED - Verbose output active"
        log_info "DEBUG: APP_DIR = $APP_DIR"
        log_info "DEBUG: PORT = ${PORT:-3000}"
        log_info "DEBUG: URL_PATH = $URL_PATH"
        log_info "DEBUG: BACKGROUND = $BACKGROUND"
    fi
    
    # Re-read config after args (args take precedence)
    read_package_config
    
    echo "=========================================="
    echo "   Documentation Interface Launcher"
    echo "=========================================="
    echo
    log_info "Configuration: Port=$PORT, Path=$URL_PATH"
    echo
    
    log_info "Checking system requirements..."
    check_node
    check_npm
    echo
    
    log_info "Checking port availability..."
    check_port
    echo
    
    log_info "Setting up environment..."
    install_dependencies
    echo
    
    log_info "Verifying documentation..."
    create_docs_folder
    check_git
    echo
    
    # Prompt for background mode if not specified via command line
    if [ "$BACKGROUND" != "true" ]; then
        prompt_background_mode
    fi
    
    log_success "All checks passed! Starting server..."
    echo
    if [ "$BACKGROUND" == "true" ]; then
        start_server "--background"
    else
        start_server
    fi
}

# Run main function
main "$@"

