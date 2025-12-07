#!/bin/bash

# Android Build Validation Script
# Validates that all required files and configurations are in place

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory"
    exit 1
fi

print_info "Validating Android build configuration..."

# Check Android directory
if [ ! -d "android" ]; then
    print_error "android/ directory not found"
    exit 1
fi
print_success "android/ directory exists"

# Check AndroidManifest.xml
if [ ! -f "android/app/src/main/AndroidManifest.xml" ]; then
    print_error "AndroidManifest.xml not found"
else
    print_success "AndroidManifest.xml exists"
    if grep -q "com.debiasdaily.app" android/app/src/main/AndroidManifest.xml; then
        print_success "AndroidManifest.xml has correct package name"
    else
        print_warning "AndroidManifest.xml package name check (may use namespace from build.gradle)"
    fi
fi

# Check build.gradle
if [ ! -f "android/app/build.gradle" ]; then
    print_error "build.gradle not found"
else
    if grep -q 'applicationId "com.debiasdaily.app"' android/app/build.gradle; then
        print_success "build.gradle has correct applicationId"
    else
        print_error "build.gradle missing applicationId"
    fi

    if grep -q "versionCode" android/app/build.gradle; then
        print_success "build.gradle has versionCode"
    else
        print_error "build.gradle missing versionCode"
    fi

    if grep -q "signingConfigs" android/app/build.gradle; then
        print_success "build.gradle has signing configuration"
    else
        print_warning "build.gradle missing signing configuration (required for release)"
    fi
fi

# Check MainActivity
if [ ! -f "android/app/src/main/java/com/debiasdaily/app/MainActivity.java" ]; then
    print_error "MainActivity.java not found"
else
    print_success "MainActivity.java exists"
fi

# Check Capacitor config
if [ ! -f "capacitor.config.ts" ]; then
    print_error "capacitor.config.ts not found"
else
    if grep -q "com.debiasdaily.app" capacitor.config.ts; then
        print_success "capacitor.config.ts has correct appId"
    else
        print_error "capacitor.config.ts missing appId"
    fi
fi

# Check Gradle wrapper
if [ ! -f "android/gradlew" ]; then
    print_error "gradlew not found"
else
    print_success "gradlew exists"
    if [ ! -x "android/gradlew" ]; then
        print_warning "gradlew is not executable (run: chmod +x android/gradlew)"
    fi
fi

# Check release notes
if [ ! -d "android/release-notes" ]; then
    print_warning "release-notes/ directory not found (create for Play Store releases)"
else
    if [ ! -f "android/release-notes/en-US.txt" ]; then
        print_warning "release-notes/en-US.txt not found"
    else
        if [ -s "android/release-notes/en-US.txt" ]; then
            print_success "release-notes/en-US.txt exists and has content"
        else
            print_warning "release-notes/en-US.txt is empty"
        fi
    fi
fi

# Check package.json scripts
if grep -q "android:build" package.json; then
    print_success "package.json has android:build script"
else
    print_warning "package.json missing android:build script"
fi

# Summary
echo ""
echo "=========================================="
echo "  Validation Summary"
echo "=========================================="
echo -e "${GREEN}✓ Passed checks completed"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS"
echo -e "${RED}✗ Errors: $ERRORS"
echo ""

if [ $ERRORS -gt 0 ]; then
    print_error "Validation failed with $ERRORS error(s)"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    print_warning "Validation passed with $WARNINGS warning(s)"
    exit 0
else
    print_success "All validations passed!"
    exit 0
fi
