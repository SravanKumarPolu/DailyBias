#!/bin/bash

# Android Build Script
# Builds Android APK or AAB for testing and release

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

# Default values
BUILD_TYPE="debug"
OUTPUT_TYPE="apk"
CLEAN_BUILD=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            BUILD_TYPE="$2"
            shift 2
            ;;
        --output)
            OUTPUT_TYPE="$2"
            shift 2
            ;;
        --clean)
            CLEAN_BUILD=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --type TYPE       Build type: debug or release (default: debug)"
            echo "  --output TYPE     Output type: apk or aab (default: apk)"
            echo "  --clean           Clean build before building"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate build type
if [[ "$BUILD_TYPE" != "debug" && "$BUILD_TYPE" != "release" ]]; then
    print_error "Invalid build type: $BUILD_TYPE (must be debug or release)"
    exit 1
fi

# Validate output type
if [[ "$OUTPUT_TYPE" != "apk" && "$OUTPUT_TYPE" != "aab" ]]; then
    print_error "Invalid output type: $OUTPUT_TYPE (must be apk or aab)"
    exit 1
fi

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory"
    exit 1
fi

print_info "Building Android $BUILD_TYPE $OUTPUT_TYPE..."

# Build web assets first
print_info "Building web assets..."
if ! pnpm build; then
    print_error "Web build failed"
    exit 1
fi
print_success "Web build completed"

# Sync Capacitor
print_info "Syncing Capacitor..."
if ! npx cap sync android; then
    print_error "Capacitor sync failed"
    exit 1
fi
print_success "Capacitor sync completed"

# Navigate to Android directory
cd android

# Clean build if requested
if [ "$CLEAN_BUILD" = true ]; then
    print_info "Cleaning build..."
    ./gradlew clean
    print_success "Build cleaned"
fi

# Grant execute permission for gradlew
chmod +x gradlew

# Build based on output type
if [ "$OUTPUT_TYPE" = "apk" ]; then
    print_info "Building APK..."
    if [ "$BUILD_TYPE" = "debug" ]; then
        ./gradlew assembleDebug
        OUTPUT_FILE="app/build/outputs/apk/debug/app-debug.apk"
    else
        ./gradlew assembleRelease
        OUTPUT_FILE="app/build/outputs/apk/release/app-release.apk"
    fi
else
    print_info "Building AAB..."
    if [ "$BUILD_TYPE" = "release" ]; then
        ./gradlew bundleRelease
        OUTPUT_FILE="app/build/outputs/bundle/release/app-release.aab"
    else
        print_error "AAB can only be built for release"
        exit 1
    fi
fi

# Check if build was successful
if [ ! -f "$OUTPUT_FILE" ]; then
    print_error "Build failed: $OUTPUT_FILE not found"
    exit 1
fi

# Get file size
SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
print_success "Build completed: $OUTPUT_FILE ($SIZE)"

# Show file location
echo ""
print_info "Output file: $(pwd)/$OUTPUT_FILE"
echo ""

# For APK, show install command
if [ "$OUTPUT_TYPE" = "apk" ]; then
    print_info "To install on connected device:"
    echo "  adb install -r $OUTPUT_FILE"
fi

cd ..
