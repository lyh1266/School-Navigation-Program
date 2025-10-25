"""
Main entry point for Indoor Navigation System
"""
import os
import sys
import argparse

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Indoor Navigation System')
    parser.add_argument('--test', action='store_true', help='Run tests')
    parser.add_argument('--deploy', action='store_true', help='Deploy cloud functions')
    parser.add_argument('--create-only', action='store_true', help='Only create cloud function directories')
    args = parser.parse_args()
    
    if args.test:
        # Run tests
        from run_tests import main as run_tests
        run_tests()
    elif args.deploy:
        # Deploy cloud functions
        from deploy import main as deploy
        deploy()
    else:
        # Show help
        parser.print_help()

if __name__ == "__main__":
    main()
