#!/bin/bash

# Device Testing Helper Script
# Provides utilities for mobile device testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Android setup
check_android() {
    print_info "Checking Android setup..."

    if ! command_exists adb; then
        print_error "adb not found. Install Android SDK Platform Tools."
        return 1
    fi

    print_success "adb found"

    # Check for connected devices
    if adb devices | grep -q "device$"; then
        print_success "Android device connected"
        adb devices
        return 0
    else
        print_warning "No Android device connected"
        print_info "Connect a device or start an emulator"
        # Return 0 to allow checks to continue even if no device is connected
        return 0
    fi
}

# Check iOS setup
check_ios() {
    print_info "Checking iOS setup..."

    if ! command_exists xcodebuild; then
        print_warning "Xcode not found. Install Xcode from App Store for iOS development."
        print_info "Note: This won't affect mobile emulation tests (Playwright)"
        # Return 0 to allow checks to continue - iOS not required for web testing
        return 0
    fi

    # Check if xcode-select is pointing to full Xcode or just Command Line Tools
    local xcode_path=$(xcode-select -p 2>/dev/null)
    if [[ "$xcode_path" == *"CommandLineTools"* ]]; then
        print_warning "Xcode Command Line Tools detected, but full Xcode is required for iOS builds"
        print_info "Note: Mobile emulation tests (Playwright) will still work"
        print_info "To fix iOS builds:"
        print_info "  1. Install Xcode from App Store (it's large, ~15GB)"
        print_info "  2. After installation, run: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
        print_info "  3. Accept license: sudo xcodebuild -license accept"
        print_info "  4. Install CocoaPods: sudo gem install cocoapods"
        # Return 0 to allow checks to continue - iOS not required for web testing
        return 0
    fi

    # Verify xcodebuild actually works (not just Command Line Tools)
    if ! xcodebuild -version >/dev/null 2>&1; then
        print_warning "xcodebuild is not working properly"
        print_info "Note: Mobile emulation tests (Playwright) will still work"
        print_info "To fix iOS builds: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
        # Return 0 to allow checks to continue
        return 0
    fi

    print_success "Xcode found"

    # Check for CocoaPods
    if ! command_exists pod; then
        print_warning "CocoaPods not found (required for iOS builds)"
        print_info "Install with: sudo gem install cocoapods"
    else
        print_success "CocoaPods found"
    fi

    # Check for connected devices/simulators
    if command_exists xcrun; then
        print_info "Available iOS simulators:"
        if xcrun simctl list devices available 2>/dev/null | grep -qi "iphone\|ipad"; then
            xcrun simctl list devices available | grep -i "iphone\|ipad"
        else
            print_warning "No iOS simulators found"
        fi
        return 0
    else
        print_warning "xcrun not found"
        return 1
    fi
}

# Build for mobile
build_mobile() {
    print_info "Building for mobile..."

    if [ ! -f "package.json" ]; then
        print_error "Not in project root directory"
        return 1
    fi

    # Check iOS setup first
    local ios_available=true
    local xcode_path=$(xcode-select -p 2>/dev/null)
    if [[ "$xcode_path" == *"CommandLineTools"* ]] || ! xcodebuild -version >/dev/null 2>&1; then
        print_warning "iOS setup incomplete - will skip iOS sync"
        print_info "Android build will proceed normally"
        ios_available=false
    fi

    print_info "Building web assets..."
    if ! pnpm build; then
        print_error "Web build failed"
        return 1
    fi

    print_success "Web build completed"

    # Sync platforms
    if [ "$ios_available" = true ]; then
        print_info "Syncing both Android and iOS..."
        if npx cap sync; then
            print_success "Mobile sync completed (Android + iOS)"
        else
            print_warning "Full sync failed, trying Android only..."
            if npx cap sync android; then
                print_success "Android sync completed"
                print_warning "iOS sync skipped due to setup issues"
            else
                print_error "Android sync failed"
                return 1
            fi
        fi
    else
        print_info "Syncing Android only (iOS setup incomplete)..."
        if npx cap sync android; then
            print_success "Android sync completed"
        else
            print_error "Android sync failed"
            return 1
        fi
    fi

    print_success "Mobile build completed"
}

# Check if server is running on port
check_server_running() {
    local port=$1
    if command_exists lsof; then
        # lsof is available on macOS and most Linux systems
        lsof -ti:$port >/dev/null 2>&1
    elif command_exists nc; then
        # Use netcat to check if port is open
        nc -z localhost $port >/dev/null 2>&1
    elif command_exists netstat; then
        # Fallback to netstat
        netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"
    else
        # Last resort: try curl
        curl -s http://localhost:$port >/dev/null 2>&1
    fi
}

# Run automated mobile emulation tests
run_mobile_tests() {
    print_info "Running automated mobile emulation tests..."

    # Check if dev server is already running
    local skip_webserver=""
    if check_server_running 3000; then
        print_success "Dev server already running on port 3000"
        print_info "Using existing server (skipping webserver startup)"
        skip_webserver="SKIP_WEBSERVER=1 "
    else
        print_info "Playwright will start dev server automatically"
        print_info "Note: First run may take a few minutes to compile"
        print_info "If it hangs, start server manually: pnpm dev"
        print_info "Then run: SKIP_WEBSERVER=1 pnpm device:test"
    fi

    print_info "Testing on mobile Chrome (Android emulation)..."
    if eval "${skip_webserver}pnpm e2e --project=mobile-chrome"; then
        print_success "Mobile Chrome tests passed"
    else
        print_warning "Mobile Chrome tests failed"
    fi

    print_info "Testing on mobile Safari (iOS emulation)..."
    if eval "${skip_webserver}pnpm e2e --project=mobile-safari"; then
        print_success "Mobile Safari tests passed"
    else
        print_warning "Mobile Safari tests failed"
    fi

    print_success "Mobile emulation tests completed"
}

# Open Android project
open_android() {
    print_info "Opening Android project in Android Studio..."

    if check_android; then
        pnpm android:open
        print_success "Android Studio should open"
    else
        print_error "Android setup incomplete"
        return 1
    fi
}

# Open iOS project
open_ios() {
    print_info "Opening iOS project in Xcode..."

    if check_ios; then
        pnpm ios:open
        print_success "Xcode should open"
    else
        print_error "iOS setup incomplete"
        return 1
    fi
}

# Show testing checklist
show_checklist() {
    print_info "Device Testing Checklist:"
    echo ""
    echo "Quick Start:"
    echo "  [ ] App launches without crash"
    echo "  [ ] Daily bias displays"
    echo "  [ ] Navigation works (all 6 tabs)"
    echo "  [ ] Favorite button works"
    echo "  [ ] Settings toggle works"
    echo "  [ ] Data persists after restart"
    echo ""
    echo "For full checklist, see: docs/device-testing-quick-start.md"
    echo "For detailed tracker, see: docs/device-testing-tracker.md"
}

# Main menu
show_menu() {
    echo ""
    echo "=========================================="
    echo "  Device Testing Helper"
    echo "=========================================="
    echo ""
    echo "1. Check Android setup"
    echo "2. Check iOS setup"
    echo "3. Build for mobile"
    echo "4. Run automated mobile tests"
    echo "5. Open Android project"
    echo "6. Open iOS project"
    echo "7. Show testing checklist"
    echo "8. All checks (Android + iOS)"
    echo "9. Exit"
    echo ""
    read -p "Select option [1-9]: " choice

    case $choice in
        1) check_android ;;
        2) check_ios ;;
        3) build_mobile ;;
        4) run_mobile_tests ;;
        5) open_android ;;
        6) open_ios ;;
        7) show_checklist ;;
        8) check_android && check_ios ;;
        9) exit 0 ;;
        *) print_error "Invalid option" ;;
    esac
}

# If script is run with arguments, execute directly
if [ $# -gt 0 ]; then
    case $1 in
        check-android) check_android ;;
        check-ios) check_ios ;;
        build) build_mobile ;;
        test) run_mobile_tests ;;
        open-android) open_android ;;
        open-ios) open_ios ;;
        checklist) show_checklist ;;
        *)
            print_error "Unknown command: $1"
            echo "Usage: $0 [check-android|check-ios|build|test|open-android|open-ios|checklist]"
            exit 1
            ;;
    esac
else
    # Interactive mode
    while true; do
        show_menu
        echo ""
        read -p "Press Enter to continue..."
    done
fi

