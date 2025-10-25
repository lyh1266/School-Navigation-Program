"""
Run script for Indoor Navigation System
"""
import os
import sys
import webbrowser
from pathlib import Path

def main():
    """Main function"""
    print("Indoor Navigation System")
    print("=======================")
    
    # Check if WeChat Developer Tools is installed
    wechat_dev_tools = None
    
    if sys.platform == 'win32':
        possible_paths = [
            r"C:\Program Files (x86)\Tencent\微信web开发者工具",
            r"C:\Program Files\Tencent\微信web开发者工具"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                wechat_dev_tools = os.path.join(path, "cli.bat")
                break
    elif sys.platform == 'darwin':
        possible_paths = [
            "/Applications/wechatwebdevtools.app",
            os.path.expanduser("~/Applications/wechatwebdevtools.app")
        ]
        for path in possible_paths:
            if os.path.exists(path):
                wechat_dev_tools = os.path.join(path, "Contents/MacOS/cli")
                break
    
    # Actions
    while True:
        print("\nOptions:")
        print("1. Run tests")
        print("2. Deploy cloud functions")
        print("3. Open project in WeChat Developer Tools")
        print("4. Open README")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ")
        
        if choice == '1':
            # Run tests
            print("\nRunning tests...")
            os.system(f"{sys.executable} main.py --test")
        elif choice == '2':
            # Deploy cloud functions
            print("\nDeploying cloud functions...")
            os.system(f"{sys.executable} main.py --deploy")
        elif choice == '3':
            # Open project in WeChat Developer Tools
            if wechat_dev_tools and os.path.exists(wechat_dev_tools):
                print("\nOpening project in WeChat Developer Tools...")
                project_path = os.path.abspath("frontend")
                os.system(f'"{wechat_dev_tools}" open --project "{project_path}"')
            else:
                print("\nWeChat Developer Tools not found.")
                print("Please open the project manually.")
        elif choice == '4':
            # Open README
            readme_path = os.path.abspath("README.md")
            if os.path.exists(readme_path):
                print("\nOpening README...")
                webbrowser.open(f"file://{readme_path}")
            else:
                print("\nREADME.md not found.")
        elif choice == '5':
            # Exit
            print("\nExiting...")
            break
        else:
            print("\nInvalid choice. Please try again.")

if __name__ == "__main__":
    main()
