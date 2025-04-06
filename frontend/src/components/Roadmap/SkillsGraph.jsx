import React, { useState, useEffect, useContext, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider, // Import ReactFlowProvider
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import dagre from "dagre"; // Import dagre
import { SkillsContext } from "../../Context/SkillsContext";

// --- Dagre Layout Configuration ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 280; // Estimate width of your TaskNode + padding
const NODE_HEIGHT = 180; // Estimate height (can vary with expansion, use an average)

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 }); // Adjust spacing

  nodes.forEach((node) => {
    // Use dimensions that better reflect the custom node size
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (nodeWithPosition) {
      // We are shifting the dagre node position (anchor=center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      };
    } else {
        // Fallback if node not found in layout (shouldn't happen)
        console.warn(`Node ${node.id} not found in Dagre layout results.`);
        node.position = { x: Math.random() * 400, y: Math.random() * 400 };
    }

    // Optional: Set target/source handles based on layout direction
    node.targetPosition = direction === 'LR' ? 'left' : 'top';
    node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';
  });

  return { nodes, edges };
};

// --- Custom Node Component ---
const TaskNode = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 rounded-lg border-2 border-gray-300 bg-white shadow-md max-w-96 m-8" style={{ minWidth: `${NODE_WIDTH - 16}px` }}> {/* Adjust width based on padding */}
      <div className="font-bold text-lg mb-2">{data.label}</div>
      <div className="text-sm text-gray-600 mb-3">{data.description}</div>
      {data.subtasks && data.subtasks.length > 0 && (
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm mb-2 transition-colors duration-150"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide Subtasks" : `Show ${data.subtasks.length} Subtasks`}
        </button>
      )}
      {expanded && (
        <div className="mt-3 border-t pt-2">
          <div className="text-sm font-semibold mb-1">Subtasks:</div>
          {data.subtasks.map((subtask, index) => (
            <div
              key={subtask.id || index} // Use subtask.id if available and unique
              className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded"
            >
              <div className="text-sm mr-2">{subtask.label}</div>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap transition-colors duration-150"
                onClick={() => data.onSubtaskAction(subtask.id)}
              >
                {subtask.buttonText || "Action"}
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Add other data points if needed */}
      <div className="text-xs text-gray-500 mt-2 border-t pt-1">
        Category: {data.category || 'N/A'} | Diff: {data.difficulty || 'N/A'} | Est: {data.estimated_time || 'N/A'}
      </div>
      {data.ai_impact && (
        <div className="text-xs text-purple-700 mt-1 italic">
          Importance: {data.ai_impact}
        </div>
      )}
    </div>
  );
};

// --- Define Node Types ---
const nodeTypes = {
  taskNode: TaskNode,
};

// --- Main Graph Component ---
const SkillsGraphInternal = () => { // Renamed to avoid conflict with provider wrapper
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { roadmap, setRoadmap } = useContext(SkillsContext);
  const url = import.meta.env.VITE_API_URL;
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle subtask button clicks
  const handleSubtaskAction = useCallback((taskId, subtaskId) => {
    console.log(`Action triggered on subtask ${subtaskId} of task ${taskId}`);
    // Implement your action logic here (e.g., mark as complete, open modal)
  }, []); // Add dependencies if needed

  // Fetch data from API
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        const result = await axios.get(url + "/roadmap/get", {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (result.data.success) {
          console.log("API Roadmap data:", result.data.data);
          if (
            result.data.data &&
            result.data.data.tasks &&
            Array.isArray(result.data.data.tasks) && // Ensure it's an array
            result.data.data.tasks.length > 0
          ) {
            setGraphData(result.data.data); // Store raw data
            setRoadmap(result.data.data); // Update context
          } else {
            console.warn("No roadmap tasks found in API response.");
            setError("No roadmap data found. Please generate a roadmap first.");
            setGraphData({ tasks: [] }); // Set empty tasks to avoid breaking layout logic later
          }
        } else {
           console.error("API call failed:", result.data.message);
           setError(result.data.message || "Failed to fetch roadmap (API error).");
           setGraphData({ tasks: [] });
        }
      } catch (err) {
        console.error("Error fetching roadmap:", err);
        setError("Failed to load roadmap. Please check connection or try again.");
        setGraphData({ tasks: [] }); // Set empty tasks on error
      } finally {
        setLoading(false);
      }
    };

    if (!roadmap || !roadmap.tasks || roadmap.tasks.length === 0) {
      console.log("No roadmap in context, fetching from API...");
      fetchRoadmap();
    } else {
      console.log("Using roadmap data from context.");
      setGraphData(roadmap);
      setLoading(false);
    }
  }, [url, roadmap, setRoadmap]); // Dependencies for fetching


  // Process data and transform to ReactFlow format using Dagre layout
  useEffect(() => {
    // Ensure graphData and tasks exist and are an array before processing
    if (!graphData || !Array.isArray(graphData.tasks)) {
        console.log("Waiting for graph data or graphData.tasks is not an array...");
        // Optionally set nodes/edges to empty if needed, depending on desired behavior
        // setNodes([]);
        // setEdges([]);
        return;
    }

     if (graphData.tasks.length === 0 && !loading) {
        console.log("No tasks to display.");
        setNodes([]);
        setEdges([]);
        return; // Exit if there are no tasks
     }

    console.log("Processing graph data for ReactFlow layout...");

    // Validate and sanitize tasks (ensure IDs are present and unique)
    const validTasks = graphData.tasks.filter(task => task && task.id != null);
    const taskIds = new Set(validTasks.map(t => t.id.toString()));

    // 1. Transform tasks into initial nodes
    const initialNodes = validTasks.map((task) => ({
      id: task.id.toString(), // CRITICAL: Ensure ID is a string
      type: "taskNode",
      // Position will be set by Dagre
      position: { x: 0, y: 0 }, // Placeholder
      data: {
        label: task.name || "Unnamed Task",
        description: task.description || "",
        subtasks: (task.subtasks || []).map((st, index) => ({
          // Ensure subtasks have unique IDs if possible, otherwise use index as fallback key
          id: st.id != null ? st.id : `${task.id}-sub-${index}`,
          label: st.name || "Unnamed Subtask",
          buttonText: st.buttonText || "Complete",
        })),
        onSubtaskAction: (subtaskId) => handleSubtaskAction(task.id, subtaskId),
        // Pass other data for display in the node
        category: task.category,
        difficulty: task.difficulty,
        estimated_time: task.estimated_time,
        ai_impact: task.ai_impact,
      },
    }));

    // 2. Transform dependencies into initial edges
    const initialEdges = [];
    validTasks.forEach((task) => {
      if (task.dependencies && Array.isArray(task.dependencies)) {
        task.dependencies.forEach((depId) => {
          const sourceId = depId.toString(); // Ensure string
          const targetId = task.id.toString(); // Ensure string

          // CRITICAL: Check if both source and target nodes actually exist
          if (taskIds.has(sourceId) && taskIds.has(targetId)) {
            initialEdges.push({
              id: `e-${sourceId}-${targetId}`, // Ensure unique edge ID
              source: sourceId,
              target: targetId,
              type: "smoothstep", // Or 'default', 'straight', 'step'
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15, // Smaller arrow
                height: 15,
              },
              style: { stroke: "#60a5fa", strokeWidth: 2 }, // Example style
            });
          } else {
            console.warn(
              `Skipping edge from ${sourceId} to ${targetId}: Node not found in task list.`
            );
          }
        });
      }
    });

    // 3. Calculate layout using Dagre
    // Only run layout if there are nodes to prevent Dagre errors
    if (initialNodes.length > 0) {
        console.log(`Running Dagre layout for ${initialNodes.length} nodes and ${initialEdges.length} edges...`);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes, // Pass the nodes *before* layout
            initialEdges, // Pass the created edges
            "LR" // Layout direction: LR (Left to Right) or TB (Top to Bottom)
        );

        console.log("Layout complete. Setting nodes and edges.");
        setNodes(layoutedNodes);
        setEdges(layoutedEdges); // Use the edges returned by layout function (or initialEdges if not modified)
    } else {
        console.log("No nodes to layout.");
        setNodes([]);
        setEdges([]);
    }

  }, [graphData, handleSubtaskAction]); // Rerun layout when graphData changes


  if (loading) {
    return <div className="p-4 text-center text-gray-600 dark:text-gray-300">Loading skills graph...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 dark:text-red-400">{error}</div>;
  }

  // Handle case where graphData is loaded but tasks array is empty after filtering
  if (!nodes || nodes.length === 0) {
     return <div className="p-4 text-center text-gray-600 dark:text-gray-300">No roadmap tasks available to display.</div>;
  }

  return (
    // Height needs to be explicitly set on the container for ReactFlow
    <div style={{ width: "100%", height: "700px" }}> {/* Increased height */}
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView // Adjusts viewport to fit all nodes
            fitViewOptions={{ padding: 0.1, maxZoom: 1.2 }} // Add padding around fitView
            minZoom={0.2} // Allow zooming out further
        >
            <Controls />
            <MiniMap nodeStrokeColor="#ccc" nodeColor="#fff" nodeBorderRadius={2} pannable zoomable />
            <Background variant="dots" gap={15} size={1} />
        </ReactFlow>
    </div>
  );
};


// --- Wrapper Component with Provider ---
// React Flow hooks like useNodesState require being inside a ReactFlowProvider
const SkillsGraph = () => {
    return (
        <ReactFlowProvider>
            <SkillsGraphInternal />
        </ReactFlowProvider>
    )
}


export default SkillsGraph;