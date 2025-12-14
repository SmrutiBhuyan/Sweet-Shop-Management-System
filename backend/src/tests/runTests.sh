#!/bin/bash

# Sweet Shop Backend Test Runner
# Run with: ./runTests.sh [test-suite]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default test suites
ALL_TESTS=(
  "unit"      # Unit tests
  "integration" # Integration tests
  "e2e"       # End-to-end tests
  "security"  # Security tests
  "performance" # Performance tests
  "all"       # All tests
)

# Function to print colored output
print_status() {
  echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to run specific test suite
run_test_suite() {
  local suite=$1
  local test_pattern=""
  
  case $suite in
    "unit")
      test_pattern="*Model.test.js|*Middleware.test.js|validation.test.js"
      ;;
    "integration")
      test_pattern="auth.test.js|sweet.test.js"
      ;;
    "e2e")
      test_pattern="e2e.test.js"
      ;;
    "security")
      test_pattern="security.test.js"
      ;;
    "performance")
      test_pattern="performance.test.js"
      ;;
    "all")
      test_pattern="*.test.js"
      ;;
    *)
      print_error "Unknown test suite: $suite"
      print_status "Available suites: ${ALL_TESTS[*]}"
      exit 1
      ;;
  esac
  
  print_status "Running $suite tests..."
  
  # Set environment for tests
  export NODE_ENV=test
  export JWT_SECRET=test_jwt_secret_key_for_testing_only
  export JWT_EXPIRE=1h
  export MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/sweet_shop_test"}
  
  # Run tests with coverage
  npx jest --testPathPattern="$test_pattern" --coverage --verbose
  
  if [ $? -eq 0 ]; then
    print_success "$suite tests passed!"
  else
    print_error "$suite tests failed!"
    exit 1
  fi
}

# Function to run tests in parallel
run_parallel_tests() {
  print_status "Running tests in parallel mode..."
  
  export NODE_ENV=test
  export JWT_SECRET=test_jwt_secret_key_for_testing_only
  export JWT_EXPIRE=1h
  export MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/sweet_shop_test"}
  
  # Run tests with max workers
  npx jest --maxWorkers=4 --coverage
  
  if [ $? -eq 0 ]; then
    print_success "All tests passed!"
  else
    print_error "Tests failed!"
    exit 1
  fi
}

# Function to run tests in watch mode
run_watch_tests() {
  print_status "Starting tests in watch mode..."
  
  export NODE_ENV=test
  export JWT_SECRET=test_jwt_secret_key_for_testing_only
  export JWT_EXPIRE=1h
  export MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/sweet_shop_test"}
  
  npx jest --watch --coverage
}

# Function to generate test report
generate_report() {
  print_status "Generating test report..."
  
  export NODE_ENV=test
  export JWT_SECRET=test_jwt_secret_key_for_testing_only
  export JWT_EXPIRE=1h
  export MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/sweet_shop_test"}
  
  npx jest --coverage --coverageReporters=html
  
  if [ -d "coverage" ]; then
    print_success "Report generated at: $(pwd)/coverage/index.html"
    # Open report in browser if possible
    if command -v xdg-open &> /dev/null; then
      xdg-open coverage/index.html
    elif command -v open &> /dev/null; then
      open coverage/index.html
    fi
  fi
}

# Function to clean test environment
clean_environment() {
  print_status "Cleaning test environment..."
  
  # Remove test database
  if command -v mongo &> /dev/null; then
    mongo sweet_shop_test --eval "db.dropDatabase()" > /dev/null 2>&1
    print_success "Test database cleaned"
  fi
  
  # Remove coverage directory
  if [ -d "coverage" ]; then
    rm -rf coverage
    print_success "Coverage reports cleaned"
  fi
  
  # Remove test uploads
  if [ -d "uploads-test" ]; then
    rm -rf uploads-test
    print_success "Test uploads cleaned"
  fi
}

# Function to show help
show_help() {
  echo "Sweet Shop Backend Test Runner"
  echo ""
  echo "Usage: ./runTests.sh [OPTION] [TEST_SUITE]"
  echo ""
  echo "Options:"
  echo "  -h, --help          Show this help message"
  echo "  -p, --parallel      Run tests in parallel"
  echo "  -w, --watch         Run tests in watch mode"
  echo "  -r, --report        Generate HTML test report"
  echo "  -c, --clean         Clean test environment"
  echo "  -a, --all           Run all test suites"
  echo ""
  echo "Test Suites:"
  echo "  unit                Unit tests (models, middleware)"
  echo "  integration         Integration tests (auth, sweets)"
  echo "  e2e                 End-to-end tests"
  echo "  security            Security tests"
  echo "  performance         Performance tests"
  echo "  all                 All test suites"
  echo ""
  echo "Examples:"
  echo "  ./runTests.sh unit              # Run unit tests"
  echo "  ./runTests.sh -p                # Run all tests in parallel"
  echo "  ./runTests.sh -w integration    # Watch integration tests"
  echo "  ./runTests.sh -a                # Run all tests"
}

# Main execution
main() {
  local option=""
  local suite="all"
  
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -h|--help)
        show_help
        exit 0
        ;;
      -p|--parallel)
        option="parallel"
        shift
        ;;
      -w|--watch)
        option="watch"
        shift
        ;;
      -r|--report)
        option="report"
        shift
        ;;
      -c|--clean)
        clean_environment
        exit 0
        ;;
      -a|--all)
        suite="all"
        shift
        ;;
      *)
        if [[ " ${ALL_TESTS[*]} " =~ " $1 " ]]; then
          suite=$1
        else
          print_error "Invalid argument: $1"
          show_help
          exit 1
        fi
        shift
        ;;
    esac
  done
  
  # Run based on option
  case $option in
    "parallel")
      run_parallel_tests
      ;;
    "watch")
      run_watch_tests
      ;;
    "report")
      generate_report
      ;;
    "")
      run_test_suite "$suite"
      ;;
  esac
}

# Run main function with all arguments
main "$@"