#!/bin/bash
# Bodaboda Logging Helper Script
# Usage: ./view-logs.sh [command]

set -e

BACKEND_CONTAINER="bodaboda-backend"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

show_help() {
    cat << EOF
Bodaboda Logging Helper

Usage: ./view-logs.sh [command]

Commands:
  live              - Show live backend logs (tail -f)
  last [N]          - Show last N lines (default 50)
  errors            - Show only ERROR level logs
  warnings          - Show only WARN level logs
  auth              - Show authentication-related logs
  registration      - Show registration-related logs
  login             - Show login-related logs
  db-logs           - Query database audit logs
  db-errors         - Show failed registrations from database
  db-logins         - Show login attempts from database
  help              - Show this help message

Examples:
  ./view-logs.sh live
  ./view-logs.sh last 100
  ./view-logs.sh errors
  ./view-logs.sh auth
  ./view-logs.sh db-logs
EOF
}

check_docker() {
    if ! docker-compose ps $BACKEND_CONTAINER | grep -q "running"; then
        print_error "Backend container is not running"
        exit 1
    fi
}

live_logs() {
    print_header "Live Backend Logs"
    docker-compose logs -f --timestamps $BACKEND_CONTAINER
}

last_logs() {
    local lines=${1:-50}
    print_header "Last $lines Lines"
    docker-compose logs --timestamps $BACKEND_CONTAINER | tail -n $lines
}

error_logs() {
    print_header "ERROR Level Logs"
    docker-compose logs --timestamps $BACKEND_CONTAINER | grep "ERROR"
}

warn_logs() {
    print_header "WARN Level Logs"
    docker-compose logs --timestamps $BACKEND_CONTAINER | grep "WARN"
}

auth_logs() {
    print_header "Authentication Logs"
    docker-compose logs --timestamps $BACKEND_CONTAINER | grep -i "auth"
}

registration_logs() {
    print_header "Registration Logs"
    docker-compose logs --timestamps $BACKEND_CONTAINER | grep -i "register"
}

login_logs() {
    print_header "Login Logs"
    docker-compose logs --timestamps $BACKEND_CONTAINER | grep -i "login"
}

db_logs() {
    print_header "Database Audit Logs (Last 20)"
    docker-compose exec postgres psql -U bodaboda -d bodaboda_db -c \
        "SELECT id, level, source, message, created_at FROM logs ORDER BY created_at DESC LIMIT 20;"
}

db_errors() {
    print_header "Failed Registrations"
    docker-compose exec postgres psql -U bodaboda -d bodaboda_db -c \
        "SELECT * FROM logs WHERE message LIKE '%Registration failed%' ORDER BY created_at DESC LIMIT 10;"
}

db_logins() {
    print_header "Login Attempts"
    docker-compose exec postgres psql -U bodaboda -d bodaboda_db -c \
        "SELECT * FROM logs WHERE source = 'AUTH' AND message LIKE '%login%' ORDER BY created_at DESC LIMIT 10;"
}

# Main logic
case "${1:-help}" in
    live)
        check_docker
        live_logs
        ;;
    last)
        check_docker
        last_logs $2
        ;;
    errors)
        check_docker
        error_logs
        ;;
    warnings)
        check_docker
        warn_logs
        ;;
    auth)
        check_docker
        auth_logs
        ;;
    registration)
        check_docker
        registration_logs
        ;;
    login)
        check_docker
        login_logs
        ;;
    db-logs)
        check_docker
        db_logs
        ;;
    db-errors)
        check_docker
        db_errors
        ;;
    db-logins)
        check_docker
        db_logins
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
