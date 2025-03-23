import React, { useState, useEffect, useContext } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import { SkillsContext } from "../../Context/SkillsContext";

// Custom node component to display tasks with subtasks
const TaskNode = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 rounded-lg border-2 border-gray-300 bg-white shadow-md min-w-64">
      <div className="font-bold text-lg mb-2">{data.label}</div>

      {/* Description */}
      <div className="text-sm text-gray-600 mb-3">{data.description}</div>

      {/* Expand/Collapse button */}
      <button
        className="bg-blue-500 text-white px-2 py-1 rounded text-sm mb-2"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide Subtasks" : "Show Subtasks"}
      </button>

      {/* Subtasks */}
      {expanded && (
        <div className="mt-3 border-t pt-2">
          <div className="text-sm font-semibold mb-1">Subtasks:</div>
          {data.subtasks.map((subtask, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded"
            >
              <div className="text-sm">{subtask.label}</div>
              <button
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                onClick={() => data.onSubtaskAction(subtask.id)}
              >
                {subtask.buttonText || "Action"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Define node types
const nodeTypes = {
  taskNode: TaskNode,
};

const SkillsGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { roadmap, setRoadmap } = useContext(SkillsContext);
  const url = import.meta.env.VITE_API_URL;
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle subtask button clicks
  const handleSubtaskAction = (taskId, subtaskId) => {
    console.log(`Action triggered on subtask ${subtaskId} of task ${taskId}`);
    // Implement your action logic here
  };

  // Fetch data from API
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const result = await axios.get(url + "/roadmap/get", {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        if (result.data.success) {
          console.log("Roadmap data:", result.data);
          if (
            result.data.data &&
            result.data.data.tasks &&
            result.data.data.tasks.length > 0
          ) {
            setGraphData(result.data.data);
            setRoadmap(result.data.data);
          } else {
            setGraphData({ error: "No roadmap data found." });
          }
        }
      } catch (error) {
        console.error("Error fetching roadmap:", error);
        setGraphData({ error: "Failed to load roadmap. Please try again." });
      } finally {
        setLoading(false);
      }
    };
    
    if (!roadmap || !roadmap.tasks || roadmap.tasks.length === 0) {
      fetchRoadmap();
    } else {
      setGraphData(roadmap);
      setLoading(false);
    }
  }, [url, roadmap, setRoadmap]);

  // Sort tasks by their dependencies to ensure proper ordering
  const sortTasksByDependencies = (tasks) => {
    // Create a map of task id to task for quick lookup
    const taskMap = new Map();
    tasks.forEach(task => taskMap.set(task.id.toString(), task));
    
    // Track visited tasks
    const visited = new Set();
    const result = [];
    
    // Depth-first traversal function
    const dfs = (taskId) => {
      if (visited.has(taskId)) return;
      
      visited.add(taskId);
      
      const task = taskMap.get(taskId);
      if (!task) return;
      
      // Process dependencies first
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          dfs(depId.toString());
        });
      }
      
      result.push(task);
    };
    
    // Start with tasks that have no dependencies
    tasks.forEach(task => {
      if (!task.dependencies || task.dependencies.length === 0) {
        dfs(task.id.toString());
      }
    });
    
    // Process any remaining tasks
    tasks.forEach(task => {
      dfs(task.id.toString());
    });
    
    return result;
  };

  // Process data and transform to ReactFlow format
  useEffect(() => {
    if (!graphData || !graphData.tasks || graphData.tasks.length === 0) return;

    // Sort tasks based on dependencies
    const sortedTasks = sortTasksByDependencies(graphData.tasks);
    
    // Calculate better positions if not provided
    const calculatePositions = (tasks) => {
      const levelMap = new Map(); // Map to track the level of each task
      const taskMap = new Map(); // Map of task id to task
      
      // Create task map for quick lookup
      tasks.forEach(task => {
        taskMap.set(task.id.toString(), task);
      });
      
      // Calculate the level of each task
      const calculateLevel = (taskId, visited = new Set()) => {
        if (levelMap.has(taskId)) return levelMap.get(taskId);
        if (visited.has(taskId)) return 0; // Prevent cycles
        
        visited.add(taskId);
        
        const task = taskMap.get(taskId);
        if (!task) return 0;
        
        if (!task.dependencies || task.dependencies.length === 0) {
          levelMap.set(taskId, 0);
          return 0;
        }
        
        // Get the maximum level of dependencies
        let maxLevel = -1;
        task.dependencies.forEach(depId => {
          const depLevel = calculateLevel(depId.toString(), new Set(visited));
          maxLevel = Math.max(maxLevel, depLevel);
        });
        
        const level = maxLevel + 1;
        levelMap.set(taskId, level);
        return level;
      };
      
      // Calculate levels for all tasks
      tasks.forEach(task => {
        calculateLevel(task.id.toString());
      });
      
      // Group tasks by level
      const tasksByLevel = new Map();
      levelMap.forEach((level, taskId) => {
        if (!tasksByLevel.has(level)) {
          tasksByLevel.set(level, []);
        }
        tasksByLevel.get(level).push(taskId);
      });
      
      // Calculate positions
      const nodeSpacingX = 250;
      const nodeSpacingY = 150;
      const nodesPerLevel = new Map(); // Track how many nodes are in each level
      
      // Initialize counters for each level
      tasksByLevel.forEach((taskIds, level) => {
        nodesPerLevel.set(level, taskIds.length);
      });
      
      // Assign positions
      levelMap.forEach((level, taskId) => {
        const task = taskMap.get(taskId);
        if (!task) return;
        
        // If task already has valid position, keep it
        if (task.position && 
            typeof task.position.x === 'number' && 
            typeof task.position.y === 'number') {
          return;
        }
        
        // Get the count of tasks in this level
        const tasksInLevel = nodesPerLevel.get(level) || 1;
        
        // Calculate index of this task in its level
        const levelTasks = tasksByLevel.get(level) || [];
        const indexInLevel = levelTasks.indexOf(taskId);
        
        // Calculate position
        const x = (level + 1) * nodeSpacingX;
        const y = (indexInLevel + 0.5) * nodeSpacingY * (600 / Math.max(tasksInLevel, 1));
        
        task.position = { x, y };
      });
      
      return tasks;
    };
    
    const tasksWithPositions = calculatePositions(sortedTasks);

    // Transform tasks into nodes
    const flowNodes = tasksWithPositions.map((task) => ({
      id: task.id.toString(),
      type: "taskNode",
      position: task.position || {
        x: Math.random() * 500,
        y: Math.random() * 500,
      }, // Fallback position
      data: {
        label: task.name,
        description: task.description,
        subtasks: (task.subtasks || []).map((st) => ({
          id: st.id,
          label: st.name,
          buttonText: st.buttonText || "Complete",
        })),
        onSubtaskAction: (subtaskId) => handleSubtaskAction(task.id, subtaskId),
      },
    }));

    // Transform dependencies into edges
    const flowEdges = [];
    tasksWithPositions.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          flowEdges.push({
            id: `e${depId}-${task.id}`,
            source: depId.toString(),
            target: task.id.toString(),
            type: "smoothstep",
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
            style: { stroke: "#4285F4", strokeWidth: 2 },
          });
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, setNodes, setEdges]);

  if (loading) {
    return <div>Loading skills graph...</div>;
  }

  if (graphData?.error) {
    return <div>{graphData.error}</div>;
  }

  return (
    <div style={{ width: "100%", height: "600px" }}>
      {(!graphData || !graphData.tasks || graphData.tasks.length === 0) ? (
        <div>No data available. Please try again later.</div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultZoom={0.8}
        >
          <Controls />
          <MiniMap nodeStrokeColor="#ccc" nodeColor="#fff" nodeBorderRadius={2} />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      )}
    </div>
  );
};

export default SkillsGraph;