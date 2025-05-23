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
import { EvaluationModalUI } from "./EvaluationModalUI";
import { Atom } from "react-loading-indicators";
import { handleError, handleSuccess } from "../../utils";
import { Send, Mic, Smile, Check, FolderCheck } from "lucide-react";
const url = import.meta.env.VITE_API_URL;
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 390; // Estimate width of your TaskNode + padding
const NODE_HEIGHT = 280; // Estimate height (can vary with expansion, use an average)

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
    node.targetPosition = direction === "LR" ? "left" : "top";
    node.sourcePosition = direction === "LR" ? "right" : "bottom";
  });

  return { nodes, edges };
};

// --- Custom Node Component ---
const TaskNode = ({ data, setGraph }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`p-4 rounded-lg border-4 border-gray-300 bg-white shadow-xl max-w-[450px] m-8 ${data.priority === "low" ? "bg-zinc-300" : ""
        } ${data.priority === "medium" ? "bg-sky-300" : ""} ${data.priority === "high" ? "bg-red-200" : ""} ${data.tag === "new" ? "border-green-600" : ""
        } ${data.tag === "updated" ? "border-blue-700" : ""}`}
      style={{ minWidth: `${NODE_WIDTH - 16}px` }}>
      {" "}
      <div
        className={`p-1 rounded-lg float-right font-bold text-xl bg-gray-300 ${data.tag === "new" ? "text-green-700 inline" : "text-blue-700 inline"
          } ${data.tag === "existing" ? "hidden" : ""}`}>
        {data.tag}
      </div>
      <div className='font-bold text-lg mb-2'>{data.label}</div>
      <div className='text-sm text-gray-600 mb-3'>{data.description}</div>
      <div className='text-xs text-gray-500 mt-1 mb-1 border-t pt-1'>
        Category: {data.category || "N/A"} | Diff: {data.difficulty || "N/A"} | Est: {data.estimated_time || "N/A"}
      </div>
      {data.subtasks && data.subtasks.length > 0 && (
        <button
          className='bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm mb-1 mt-1 transition-colors duration-150'
          onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide Subtasks" : `Show ${data.subtasks.length} Subtasks`}
        </button>
      )}
      {expanded && (
        <div className='mt-1 border-t pt-2'>
          <div className='text-sm font-semibold mb-1'>Subtasks:</div>
          {data.subtasks.map((subtask, index) => (
            <div
              key={subtask.id || index} // Use subtask.id if available and unique
              className='flex items-center justify-between flex-col mb-2 p-2 rounded border border-blue-300'>
              <div className="flex flex-row">
                <div className="inline mr-1"> {subtask.completed ? <Check /> : <FolderCheck />} </div>
                <div className='text-sm mr-2 inline'>{subtask.label}</div>
              </div>
              <div className='flex flex-row justify-between mt-2'>
                {" "}
                <button
                  className={`${!subtask.completed ? "bg-green-500 hover:bg-green-600" : "bg-red-400 hover:bg-red-500"} text-white px-2 py-1 m-1 rounded text-xs whitespace-nowrap transition-colors duration-150`}
                  onClick={() => data.onSubtaskComplete(subtask.id, subtask.label, data.label)}>
                  {!subtask.completed ? subtask.buttonText : "Reset"}
                </button>
                <button
                  className='bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-1 rounded text-xs whitespace-nowrap transition-colors duration-150 w-16'
                  onClick={() => {
                    console.log("Sources:", subtask.sources);
                    data.showSources(subtask.sources);
                  }}>
                  Sources
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {data.ai_impact && <div className='text-xs text-purple-700 mt-1 italic'>Importance: {data.ai_impact}</div>}
    </div>
  );
};

// --- Define Node Types ---
const nodeTypes = {
  taskNode: TaskNode,
};

// --- Main Graph Component ---
const SkillsGraphInternal = ({ setSources, setShowSourcesModal, graphData, loading, error }) => {
  // Renamed to avoid conflict with provider wrapper
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [evaluationModal, setEvaluationModal] = useState({
    open: false,
    stId: null,
    subTaskName: '',
    taskName: '',
    messages: [],
    file: null,
    inputMessage: ''
  });

  const checkCompleted = useCallback((stId, subTaskName, taskName) => {
    setEvaluationModal({
      open: true,
      stId,
      subTaskName,
      taskName,
      messages: [],
      file: null,
      inputMessage: ''
    });
  }, []);
  const handleShowSourcesModal = useCallback(
    (sources) => {
      console.log(`Sources: ${sources}`);
      setSources(sources);
      setShowSourcesModal(true);
    },
    [setSources, setShowSourcesModal]
  ); // Added dependencies

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
    const validTasks = graphData.tasks.filter((task) => task && task.id != null);
    const taskIds = new Set(validTasks.map((t) => t.id.toString()));

    // 1. Transform tasks into initial nodes
    const initialNodes = validTasks.map((task) => ({
      id: task.id.toString(), // CRITICAL: Ensure ID is a string
      type: "taskNode",
      // Position will be set by Dagre
      position: { x: 0, y: 0 }, // Placeholder
      data: {
        label: task.name || "Unnamed Task",
        tag: task.tag || "existing",
        description: task.description || "",
        priority: task.priority || "medium",
        onSubtaskComplete: checkCompleted,
        subtasks: (task.subtasks || []).map((st, index) => ({
          // Ensure subtasks have unique IDs if possible, otherwise use index as fallback key
          id: st.id != null ? st.id : `${task.id}-sub-${index}`,
          label: st.name || "Unnamed Subtask",
          buttonText: st.buttonText || "Complete",
          sources: st.sources || "",
          completed: st.completed || false,
        })),
        onSubtaskAction: (subtaskId) => handleSubtaskAction(task.id, subtaskId),
        // Pass other data for display in the node
        category: task.category,
        difficulty: task.difficulty,
        estimated_time: task.estimated_time,
        ai_impact: task.ai_impact,
        showSources: (sources) => handleShowSourcesModal(sources),
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
            console.warn(`Skipping edge from ${sourceId} to ${targetId}: Node not found in task list.`);
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
    return (
      <div className='flex justify-center align-bottom'>
        <Atom color='#32cd32' size='large' text='Loading Roadmap Graph' textColor='#17d83f' />
      </div>
    );
  }

  if (error) {
    return <div className='p-4 text-center text-red-600 dark:text-red-400'>{error}</div>;
  }

  // Handle case where graphData is loaded but tasks array is empty after filtering
  if (!nodes || nodes.length === 0) {
    return <div className='p-4 text-center text-gray-600 dark:text-gray-300'>No roadmap tasks available to display.</div>;
  }

  return (
    // Height needs to be explicitly set on the container for ReactFlow
    <div style={{ width: "100%", height: "700px" }}>
      {" "}
      {/* Increased height */}
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
        <MiniMap nodeStrokeColor='#ccc' nodeColor='#fff' nodeBorderRadius={2} pannable zoomable />
        <Background variant='dots' gap={15} size={1} />
      </ReactFlow>
      {evaluationModal.open && <EvaluationModalUI evaluationModal={evaluationModal} setEvaluationModal={setEvaluationModal} />}
    </div>
  );
};
import CareerPathSelector from "./CareerPathSelector";
// import { useContext } from "react";
// import { SkillsContext } from "../../Context/SkillsContext";
// --- Wrapper Component with Provider ---
// React Flow hooks like useNodesState require being inside a ReactFlowProvider
const SkillsGraph = () => {
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [sources, setSources] = useState("");
  const [selectedPath, setSelectedPath] = useState(null);
  const handlePathSelection = (pathObject) => {
    console.log("Selected Path Object:", pathObject);
    setSelectedPath(pathObject);
  };
  const { setIsPathSelected, isPathSelected, roadmap, setRoadmap, setCareerPath, suggestedChanges, setSuggestedChanges } =
    useContext(SkillsContext);
  const [careerData, setCareerData] = useState({});

  useEffect(() => {
    if (isPathSelected) return;
    if (roadmap && roadmap.length > 0) {
      return;
    }
    const fetchPaths = async () => {
      setModifyLoading(true);
      const result = await axios.get(url + "/roadmap/career-paths", {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      });
      setModifyLoading(false);
      setCareerData(result.data.data);
    };
    fetchPaths();
  }, [roadmap, isPathSelected]);

  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!isPathSelected) return;
      setModifyLoading(true);
      try {
        if (roadmap && roadmap && roadmap.length > 0) {
          handleSuccess("Using cached roadmap data from localStorage.");
          setGraphData({
            tasks: roadmap,
          });
          setLoading(false);
          return;
        }
        setLoading(true);
        setModifyLoading(true);
        setError(null);
        setCareerPath(selectedPath.Path_name);
        const result = await axios.post(
          url + "/roadmap/generate",
          { selectedPath },
          {
            withCredentials: true,
            headers: {
              Accept: "application/json",
            },
          }
        );
        if (result.data.success) {
          console.log("API Roadmap data:", result.data.data);
          localStorage.setItem("roadmap", JSON.stringify(result.data.data)); // Store raw data in localStorage
          if (
            result.data.data &&
            result.data.data.tasks &&
            Array.isArray(result.data.data.tasks) && // Ensure it's an array
            result.data.data.tasks.length > 0
          ) {
            setGraphData(result.data.data); // Store raw data
            setRoadmap(result.data.data.tasks); // Update context
            setSuggestedChanges(result.data.changes);
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
        setModifyLoading(false);
      }
    };

    if (!roadmap || !roadmap.tasks || roadmap.tasks.length === 0) {
      console.log("No roadmap in context, fetching from API...");
      fetchRoadmap();
    } else {
      console.log("Using roadmap data from context.");
      setGraphData({ tasks: roadmap });
      setLoading(false);
    }
  }, [isPathSelected, roadmap]);

  const [modificationText, setModificationText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const handleSuggestionClick = (suggestion) => {
    setModificationText(suggestion);
    setShowSuggestions(false);
  };

  const [modifyLoading, setModifyLoading] = useState(false);
  const modify = async () => {
    if (!modificationText || modificationText.length < 4) {
      handleError("What changes?");
      return;
    }
    setModifyLoading(true);
    try {
      const result = await axios.get(url + `/roadmap/modify?text=${modificationText}`, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      });
      if (result.data.success) {
        setModificationText("");
        setGraphData(result.data.data);
        setRoadmap(result.data.data.tasks);
        setModifyLoading(false);
      } else {
        handleError("server error");
        setModifyLoading(false);
      }
    } catch (error) {
      handleError("error");
      setModifyLoading(false);
    } finally {
      setModifyLoading(false);
    }
  };
  return (
    <>
      {!isPathSelected ? (
        <CareerPathSelector
          setIsPathSelected={setIsPathSelected}
          pathsData={careerData}
          selectedPathName={selectedPath ? selectedPath.Path_name : null}
          onPathSelect={handlePathSelection}
        />
      ) : (
        <div>
          <ReactFlowProvider>
            <SkillsGraphInternal
              setShowSourcesModal={setShowSourcesModal}
              setSources={setSources}
              graphData={graphData}
              loading={loading}
              error={error}
            />
          </ReactFlowProvider>

          <InputArea setModificationText={setModificationText} showSuggestions={showSuggestions} setShowSuggestions={setShowSuggestions} suggestedChanges={suggestedChanges} handleSuggestionClick={handleSuggestionClick} modificationText={setModificationText}/>
          
          {showSourcesModal && (
            <div className='w-1/3 fixed top-20 right-8 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6'>
              <span className="absolute top-3 left-3">Sources</span>
              <button className='absolute top-2 right-2 text-gray-500 hover:text-gray-700' onClick={() => setShowSourcesModal(false)}>
                ❌
              </button>
              <div className='overflow-y-auto max-h-[60vh] p-4'>
                <div dangerouslySetInnerHTML={{ __html: sources }}></div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

function InputArea({ handleSuggestionClick, showSuggestions, suggestedChanges, modificationText, setModificationText, setShowSuggestions }) {
  return (
    <div className='fixed bottom-1 left-[40%] w-full max-w-2xl mx-auto px-4'>
      <div className='relative'>
        {showSuggestions && suggestedChanges.length > 0 && (
          <ul className='absolute bottom-full mb-2 w-full bg-gray-300 dark:bg-slate-300 text-black rounded-md shadow-lg z-50'>
            {suggestedChanges.map((item, i) => (
              <li key={i} onClick={() => handleSuggestionClick(item)} className='cursor-pointer px-4 py-2 hover:bg-gray-200 text-sm'>
                {item}
              </li>
            ))}
          </ul>
        )}
        <div className='flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 shadow-lg'>
          <input
            value={modificationText}
            onChange={(e) => setModificationText(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            disabled={modifyLoading}
            type='text'
            placeholder='Need Modifications?'
            className='flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none px-2 text-sm'
          />
          <button
            onClick={modify}
            disabled={modifyLoading}
            className={`bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition shadow-md disabled:opacity-50`}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SkillsGraph;
