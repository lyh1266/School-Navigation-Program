"""
Deployment script for Indoor Navigation System
Helps deploy cloud functions to WeChat Mini Program cloud environment
"""
import os
import json
import argparse
import subprocess
import shutil
from pathlib import Path

def load_config():
    """Load cloud function configuration"""
    with open('cloud.config.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def create_cloud_function_dir(function_name, handler_path, runtime):
    """Create a directory for a cloud function"""
    # Create directory
    function_dir = Path(f"cloudfunctions/{function_name}")
    function_dir.mkdir(parents=True, exist_ok=True)
    
    # Parse handler path
    module_path, function_name = handler_path.rsplit('.', 1)
    module_parts = module_path.split('.')
    
    # Create index.js
    index_content = f"""// Cloud Function {function_name}
const cloud = require('wx-server-sdk')
cloud.init({{
  env: cloud.DYNAMIC_CURRENT_ENV
}})

// Main handler
exports.main = async (event, context) => {{
  try {{
    // Call Python handler
    const result = await cloud.callFunction({{
      name: 'python-runtime',
      data: {{
        module: '{module_path}',
        function: '{function_name}',
        args: [event, context]
      }}
    }})
    
    return result.result
  }} catch (error) {{
    console.error(error)
    return {{
      statusCode: 500,
      body: JSON.stringify({{
        error: error.message
      }})
    }}
  }}
}}
"""
    
    with open(function_dir / 'index.js', 'w', encoding='utf-8') as f:
        f.write(index_content)
    
    # Create package.json
    package_content = {
        "name": function_name,
        "version": "1.0.0",
        "description": f"Cloud function for {function_name}",
        "main": "index.js",
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "author": "",
        "license": "ISC",
        "dependencies": {
            "wx-server-sdk": "~2.6.3"
        }
    }
    
    with open(function_dir / 'package.json', 'w', encoding='utf-8') as f:
        json.dump(package_content, f, indent=2)
    
    print(f"Created cloud function: {function_name}")

def create_python_runtime():
    """Create the Python runtime cloud function"""
    function_dir = Path("cloudfunctions/python-runtime")
    function_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy backend files
    backend_dir = function_dir / "backend"
    if backend_dir.exists():
        shutil.rmtree(backend_dir)
    shutil.copytree("backend", backend_dir)
    
    # Create index.js
    index_content = """// Python Runtime for Cloud Functions
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// Main handler
exports.main = async (event, context) => {
  try {
    const { module, function: func, args } = event
    
    // Import Python module
    const python = require('./python-shell')
    
    // Execute Python code
    const result = await python.runModule(module, func, args)
    
    return result
  } catch (error) {
    console.error(error)
    return {
      error: error.message
    }
  }
}
"""
    
    with open(function_dir / 'index.js', 'w', encoding='utf-8') as f:
        f.write(index_content)
    
    # Create python-shell.js
    python_shell_content = """// Python Shell for Cloud Functions
const { spawn } = require('child_process')
const path = require('path')

// Run Python module
exports.runModule = (module, func, args) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      '-c',
      `import json, sys; sys.path.append('.'); ` +
      `from ${module} import ${func}; ` +
      `args = json.loads(sys.argv[1]); ` +
      `result = ${func}(*args); ` +
      `print(json.dumps(result))`
    ], {
      cwd: path.resolve(__dirname),
      env: process.env
    })
    
    let result = ''
    let error = ''
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`))
      } else {
        try {
          resolve(JSON.parse(result))
        } catch (e) {
          reject(new Error(`Failed to parse Python result: ${result}`))
        }
      }
    })
    
    // Pass arguments to Python
    pythonProcess.stdin.write(JSON.stringify(args))
    pythonProcess.stdin.end()
  })
}
"""
    
    with open(function_dir / 'python-shell.js', 'w', encoding='utf-8') as f:
        f.write(python_shell_content)
    
    # Create package.json
    package_content = {
        "name": "python-runtime",
        "version": "1.0.0",
        "description": "Python runtime for cloud functions",
        "main": "index.js",
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "author": "",
        "license": "ISC",
        "dependencies": {
            "wx-server-sdk": "~2.6.3"
        }
    }
    
    with open(function_dir / 'package.json', 'w', encoding='utf-8') as f:
        json.dump(package_content, f, indent=2)
    
    # Copy requirements.txt
    shutil.copy("requirements.txt", function_dir / "requirements.txt")
    
    print("Created Python runtime cloud function")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Deploy Indoor Navigation System')
    parser.add_argument('--create-only', action='store_true', help='Only create cloud function directories')
    args = parser.parse_args()
    
    # Load configuration
    config = load_config()
    
    # Create cloudfunctions directory
    os.makedirs("cloudfunctions", exist_ok=True)
    
    # Create Python runtime
    create_python_runtime()
    
    # Create cloud functions
    for function in config['functions']:
        create_cloud_function_dir(
            function['name'],
            function['handler'],
            function['runtime']
        )
    
    print("\nCloud functions created successfully!")
    print("To deploy:")
    print("1. Open the project in WeChat Developer Tools")
    print("2. Right-click on each cloud function and select 'Upload and Deploy: All Files'")
    print("3. Configure environment variables in the cloud console")

if __name__ == "__main__":
    main()
