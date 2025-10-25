"""
Test script for instruction parser
"""
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.instruction_parser import InstructionParser

def test_basic_instructions():
    """Test basic navigation instructions"""
    parser = InstructionParser()
    
    # Test cases
    test_cases = [
        {
            'input': '去三楼302教室',
            'expected': {
                'command_type': 'navigate',
                'destination': '3楼302教室',
                'floor': '3楼',
                'room_number': '302'
            }
        },
        {
            'input': '带我到一楼大厅',
            'expected': {
                'command_type': 'navigate',
                'destination': '1楼大厅',
                'floor': '1楼',
                'room_number': None
            }
        },
        {
            'input': '怎么去5楼实验室',
            'expected': {
                'command_type': 'navigate',
                'destination': '5楼实验室',
                'floor': '5楼',
                'room_number': None
            }
        },
        {
            'input': '四楼洗手间在哪里',
            'expected': {
                'command_type': 'search',
                'destination': '4楼洗手间',
                'floor': '4楼',
                'room_number': None
            }
        }
    ]
    
    # Run tests
    for i, test in enumerate(test_cases):
        print(f"\nTest {i+1}: '{test['input']}'")
        result = parser.parse(test['input'])
        print(f"Result: {result}")
        
        # Verify command type
        assert result['command_type'] == test['expected']['command_type'], \
            f"Command type mismatch: {result['command_type']} != {test['expected']['command_type']}"
        
        # Verify destination
        assert result['destination'] == test['expected']['destination'], \
            f"Destination mismatch: {result['destination']} != {test['expected']['destination']}"
        
        # Verify floor
        assert result['floor'] == test['expected']['floor'], \
            f"Floor mismatch: {result['floor']} != {test['expected']['floor']}"
        
        # Verify room number
        assert result['room_number'] == test['expected']['room_number'], \
            f"Room number mismatch: {result['room_number']} != {test['expected']['room_number']}"
    
    return True

def test_standardize_location():
    """Test location standardization"""
    parser = InstructionParser()
    
    # Test cases
    test_cases = [
        {
            'input': '三零二教室',
            'expected': '3楼302教室'
        },
        {
            'input': '去3楼302',
            'expected': '3楼302教室'
        },
        {
            'input': '一楼厕所',
            'expected': '1楼洗手间'
        },
        {
            'input': '5层试验室',
            'expected': '5楼实验室'
        }
    ]
    
    # Run tests
    for i, test in enumerate(test_cases):
        print(f"\nStandardize Test {i+1}: '{test['input']}'")
        result = parser.standardize_location(test['input'])
        print(f"Result: {result}")
        
        # Verify standardized location
        assert result == test['expected'], \
            f"Standardized location mismatch: {result} != {test['expected']}"
    
    return True

if __name__ == "__main__":
    print("Testing instruction parser...")
    
    test_basic_instructions()
    test_standardize_location()
    
    print("\nAll tests passed!")
