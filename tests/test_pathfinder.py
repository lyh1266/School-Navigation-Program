"""
Test script for pathfinding algorithm
"""
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.path_finder import PathFinder, BuildingGraph, generate_navigation_instructions

def test_simple_path():
    """Test a simple path with no obstacles"""
    # Create a simple graph
    graph = BuildingGraph()
    
    # Add nodes (node_id, x, y, floor)
    graph.add_node("A", 0, 0, 1)  # 1楼入口
    graph.add_node("B", 10, 0, 1)  # 1楼走廊
    graph.add_node("C", 20, 0, 1)  # 1楼楼梯
    graph.add_node("D", 20, 0, 2)  # 2楼楼梯
    graph.add_node("E", 30, 0, 2)  # 2楼走廊
    graph.add_node("F", 30, 10, 2)  # 2楼教室
    
    # Add edges (node1_id, node2_id, distance)
    graph.add_edge("A", "B", 10)
    graph.add_edge("B", "C", 10)
    graph.add_edge("C", "D", 5)  # 楼梯
    graph.add_edge("D", "E", 10)
    graph.add_edge("E", "F", 10)
    
    # Add special locations
    graph.add_special_location("1楼入口", "A")
    graph.add_special_location("2楼教室", "F")
    
    # Create path finder
    path_finder = PathFinder(graph)
    
    # Find path from 1楼入口 to 2楼教室
    start_node = graph.get_node_by_location("1楼入口")
    end_node = graph.get_node_by_location("2楼教室")
    
    path = path_finder.find_path(start_node.id, end_node.id)
    
    # Generate instructions
    instructions = generate_navigation_instructions(path, graph)
    
    # Print results
    print("Path:", path)
    print("Instructions:")
    for i, instruction in enumerate(instructions):
        print(f"{i+1}. {instruction}")
    
    # Verify path
    assert path == ["A", "B", "C", "D", "E", "F"], "Path is incorrect"
    
    return True

def test_congestion_path():
    """Test a path with congestion"""
    # Create a simple graph
    graph = BuildingGraph()
    
    # Add nodes (node_id, x, y, floor)
    graph.add_node("A", 0, 0, 1)  # 1楼入口
    graph.add_node("B1", 10, 0, 1)  # 1楼走廊1
    graph.add_node("B2", 10, 10, 1)  # 1楼走廊2 (alternative route)
    graph.add_node("C", 20, 0, 1)  # 1楼楼梯
    graph.add_node("D", 20, 0, 2)  # 2楼楼梯
    graph.add_node("E", 30, 0, 2)  # 2楼走廊
    graph.add_node("F", 30, 10, 2)  # 2楼教室
    
    # Add edges (node1_id, node2_id, distance)
    graph.add_edge("A", "B1", 10)
    graph.add_edge("A", "B2", 14.14)  # Longer but might be less congested
    graph.add_edge("B1", "C", 10)
    graph.add_edge("B2", "C", 14.14)
    graph.add_edge("C", "D", 5)  # 楼梯
    graph.add_edge("D", "E", 10)
    graph.add_edge("E", "F", 10)
    
    # Add special locations
    graph.add_special_location("1楼入口", "A")
    graph.add_special_location("2楼教室", "F")
    
    # Create path finder
    path_finder = PathFinder(graph)
    
    # Congestion data - B1->C is congested
    congestion_data = {
        ("B1", "C"): 0.8  # 80% congestion
    }
    
    # Find path from 1楼入口 to 2楼教室
    start_node = graph.get_node_by_location("1楼入口")
    end_node = graph.get_node_by_location("2楼教室")
    
    path = path_finder.find_path(start_node.id, end_node.id, congestion_data)
    
    # Generate instructions
    instructions = generate_navigation_instructions(path, graph)
    
    # Print results
    print("\nPath with congestion:", path)
    print("Instructions:")
    for i, instruction in enumerate(instructions):
        print(f"{i+1}. {instruction}")
    
    # Verify path - should take the alternative route
    assert path == ["A", "B2", "C", "D", "E", "F"], "Path is incorrect"
    
    return True

if __name__ == "__main__":
    print("Testing pathfinding algorithm...")
    
    test_simple_path()
    test_congestion_path()
    
    print("\nAll tests passed!")
