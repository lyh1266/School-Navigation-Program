"""
Run tests for Indoor Navigation System
"""
import os
import sys
import importlib
from pathlib import Path

def run_test_file(test_file):
    """Run a test file"""
    print(f"\n{'='*60}")
    print(f"Running test: {test_file}")
    print(f"{'='*60}")
    
    # Import and run the test file
    module_name = test_file.replace('.py', '').replace('/', '.')
    test_module = importlib.import_module(module_name)
    
    # Run the test
    if hasattr(test_module, 'main'):
        test_module.main()
    
    print(f"\n{'='*60}")
    print(f"Test completed: {test_file}")
    print(f"{'='*60}")

def main():
    """Main function"""
    # Find all test files
    test_dir = Path("tests")
    test_files = [str(p.relative_to(".")) for p in test_dir.glob("test_*.py")]
    
    if not test_files:
        print("No test files found!")
        return
    
    print(f"Found {len(test_files)} test files:")
    for i, test_file in enumerate(test_files):
        print(f"{i+1}. {test_file}")
    
    # Run all tests
    for test_file in test_files:
        run_test_file(test_file)
    
    print("\nAll tests completed successfully!")

if __name__ == "__main__":
    main()
