#!/bin/bash

# Android Testing Script
# Runs automated tests for Android builds

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory"
    exit 1
fi

print_info "Running Android tests..."

# Navigate to Android directory
cd android

# Grant execute permission for gradlew
chmod +x gradlew

# Run lint
print_info "Running Android Lint..."
if ./gradlew lint; then
    print_success "Lint passed"
else
    print_warning "Lint found issues (check reports)"
fi

# Run unit tests
print_info "Running unit tests..."
if ./gradlew test; then
    print_success "Unit tests passed"
else
    print_warning "Some unit tests failed (check reports)"
fi

# Check for connected devices
print_info "Checking for connected Android devices..."
if command -v adb >/dev/null 2>&1; then
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)
    if [ "$DEVICES" -gt 0 ]; then
        print_success "$DEVICES device(s) connected"
        print_info "Running instrumentation tests..."
        if ./gradlew connectedAndroidTest; then
            print_success "Instrumentation tests passed"
        else
            print_warning "Some instrumentation tests failed"
        fi
    else
        print_warning "No devices connected - skipping instrumentation tests"
        print_info "Connect a device or start an emulator to run instrumentation tests"
    fi
else
    print_warning "adb not found - skipping device tests"
fi

cd ..

print_success "Android testing completed"
