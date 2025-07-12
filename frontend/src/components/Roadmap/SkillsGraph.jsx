import React, { useState, useEffect, useContext, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import dagre from "dagre";
import { SkillsContext } from "../../Context/SkillsContext";
import EvaluationModalUI from "./EvaluationModalUI.jsx";
import { useMarketAnalysis, MarketAnalysisButton, MarketAnalysisModal } from "./MarketAnalysis";
import { Atom } from "react-loading-indicators";
import { handleError, handleSuccess } from "../../utils";
import { Send, ChevronDown, ChevronRight, Loader2, Circle, Check, RefreshCcw } from "lucide-react";
const url = import.meta.env.VITE_API_URL;
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 550; // Estimate width of your TaskNode + padding
const NODE_HEIGHT = 250; // Estimate height (can vary with expansion, use an average)

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
// Renders each task node in the graph, including progress, subtasks, and actions.
const TaskNode = ({ data }) => {
  // State for expanding/collapsing subtasks
  const [expanded, setExpanded] = useState(false);
  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);

  // Calculate progress for this node
  const completedSubtasks = data.subtasks?.filter((st) => st.completed)?.length || 0;
  const totalSubtasks = data.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div
      className={`p-4 rounded-lg border-4 shadow-xl m-8 transition-all duration-300 
        ${data.priority === "low" ? "bg-green-200 dark:bg-green-900" : ""}
        ${data.priority === "medium" ? "bg-sky-200 dark:bg-sky-900" : ""}
        ${data.priority === "high" ? "bg-red-100 dark:bg-red-900" : ""}
        ${data.tag === "new" ? "border-green-600" : ""}
        ${data.tag === "updated" ? "border-blue-600" : ""}
        ${data.tag !== "new" && data.tag !== "updated" ? "border-gray-400" : ""}
        ${isHovered ? "transform scale-[1.02]" : ""}`}
      style={{ maxWidth: `${NODE_WIDTH - 10}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* React Flow handles for edges */}
      <Handle type='target' position={Position.Left} style={{ background: "#3B82F6", left: 24 }} />
      <Handle type='source' position={Position.Right} style={{ background: "#3B82F6", right: 24 }} />

      {/* Progress Bar for node completion */}
      <div className='absolute top-0 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-t overflow-hidden'>
        <div
          className='h-full transition-all duration-500 ease-out'
          style={{
            width: `${progress}%`,
            backgroundColor: `rgb(${255 * (1 - progress / 100)}, ${255 * (progress / 100)}, 100)`,
          }}
        />
      </div>

      <div className='relative mt-2'>
        {/* Tag for new/updated nodes */}
        <div
          className={`p-1 rounded-lg float-right text-sm font-semibold ${
            data.tag === "new"
              ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900"
              : data.tag === "updated"
              ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900"
              : "hidden"
          }`}>
          {data.tag}
        </div>

        {/* Node label and description */}
        <div className='font-bold text-lg mb-2 dark:text-white'>{data.label}</div>
        <div className='text-sm text-gray-600 dark:text-gray-300 mb-3'>{data.description}</div>

        {/* Node metadata: progress, category, difficulty, time */}
        <div className='text-xs space-x-2 mt-1 mb-1 border-t pt-1 dark:text-gray-400'>
          <span className='inline-flex items-center'>
            <span className='font-medium mr-1'>Progress:</span>
            <span className={`${progress === 100 ? "text-green-500" : "text-blue-500"}`}>{Math.round(progress)}%</span>
          </span>
          <span>•</span>
          <span>{data.category || "N/A"}</span>
          <span>•</span>
          <span>{data.difficulty || "N/A"}</span>
          <span>•</span>
          <span>{data.estimated_time || "N/A"}</span>
        </div>

        {/* Subtasks section: expandable, with completion and evaluation actions */}
        {data.subtasks?.length > 0 && (
          <>
            <button
              className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 
                text-white px-3 py-1.5 rounded text-sm mb-1 mt-1 transition-colors duration-150
                flex items-center gap-2 shadow-sm hover:shadow'
              onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <>
                  <ChevronDown size={16} />
                  Hide Subtasks
                </>
              ) : (
                <>
                  <ChevronRight size={16} />
                  Show {data.subtasks.length} Subtasks
                </>
              )}
            </button>

            {expanded && (
              <div className='mt-3 space-y-2'>
                {/* Render each subtask with completion, evaluation, and sources */}
                {data.subtasks.map((subtask, index) => (
                  <div
                    key={subtask.id || index}
                    className={`p-3 rounded-lg border transition-all duration-300 transform
                      ${
                        subtask.completed
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 scale-100"
                          : subtask.evaluating
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 animate-pulse scale-100"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:scale-[1.02]"
                      }`}>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        {/* Subtask status icon */}
                        {subtask.completed ? (
                          <div className='text-green-500 dark:text-green-400'>
                            <Check size={18} />
                          </div>
                        ) : subtask.evaluating ? (
                          <div className='text-blue-500 dark:text-blue-400 animate-spin'>
                            <Loader2 size={18} />
                          </div>
                        ) : (
                          <div className='text-gray-400 dark:text-gray-500'>
                            <Circle size={18} />
                          </div>
                        )}
                        <span className='text-sm dark:text-gray-200'>{subtask.label}</span>
                      </div>

                      <div className='flex items-center gap-2'>
                        {/* Complete/Reset/Evaluate subtask button */}
                        <button
                          className={`px-3 py-1 rounded text-xs font-medium transition-all duration-150 ${
                            subtask.completed ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          onClick={() => {
                            console.log("Opening evaluation modal with:", {
                              taskId: data.id,
                              subtaskId: subtask.id,
                              subtaskLabel: subtask.label,
                              taskLabel: data.label,
                            });
                            data.onSubtaskComplete(data.id, subtask.id, subtask.label, data.label);
                          }}
                          disabled={subtask.evaluating}>
                          {subtask.evaluating ? "Evaluating..." : subtask.completed ? "Reset" : subtask.buttonText}
                        </button>{" "}
                        {/* Show sources for subtask */}
                        <button
                          onClick={() => data.showSources(subtask.sources)}
                          className='px-3 py-1 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 
                              dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors'>
                          Sources
                        </button>
                        {/* Market analysis for subtask skills */}
                        <MarketAnalysisButton subtaskLabel={subtask.label} skills={subtask.skills} onAnalysis={data.onMarketAnalysis} />
                      </div>
                    </div>
                    {/* Subtask evaluation feedback */}
                    {subtask.evaluation && (
                      <div
                        className='mt-2 text-xs p-2 rounded bg-gray-50 dark:bg-gray-800 border 
                        border-gray-100 dark:border-gray-700'>
                        <div className='font-medium text-gray-700 dark:text-gray-300'>
                          Last Submission: {new Date(subtask.evaluation.submittedAt).toLocaleDateString()}
                        </div>
                        {subtask.evaluation.analysis && (
                          <div className='mt-1 text-gray-600 dark:text-gray-400'>{subtask.evaluation.analysis}</div>
                        )}
                      </div>
                    )}
                    {/* Subtask labels: subtle, below subtask label, less priority */}
                    {subtask.labels && subtask.labels.length > 0 && (
                      <div className='flex flex-wrap gap-1 mt-1 mb-0.5'>
                        {subtask.labels.map((label, idx) => (
                          <span
                            key={idx}
                            className='bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-sm text-[10px] font-normal border border-gray-200 dark:border-gray-700 opacity-80'>
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Show AI impact/importance if present */}
      {data.ai_impact && <div className='mt-2 text-xs text-purple-700 dark:text-purple-400 italic'>Importance: {data.ai_impact}</div>}
    </div>
  );
};

// --- Define Node Types for React Flow ---
const nodeTypes = {
  taskNode: TaskNode,
};

// --- Main Graph Component ---
// Handles graph data, layout, and rendering the React Flow graph
const SkillsGraphInternal = ({ setSources, setShowSourcesModal, graphData, loading, error, onMarketAnalysis }) => {
  // State for nodes and edges in React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // State for evaluation modal (subtask completion)
  const [evaluationModal, setEvaluationModal] = useState({
    open: false,
    stId: null,
    subTaskName: "",
    taskName: "",
    messages: [],
    file: null,
    inputMessage: "",
  });
  // Callback for subtask completion (opens modal)
  const checkCompleted = useCallback((taskId, stId, subTaskName, taskName) => {
    // Ensure IDs are numbers
    const parsedTaskId = parseInt(taskId);
    const parsedStId = parseInt(stId);

    if (isNaN(parsedTaskId) || isNaN(parsedStId)) {
      console.error("Invalid IDs:", { taskId, stId });
      return;
    }

    setEvaluationModal({
      open: true,
      stId: parsedStId,
      taskId: parsedTaskId,
      subTaskName,
      taskName,
      messages: [],
      file: null,
      inputMessage: "",
    });

    console.log("Modal initialized with:", {
      stId: parsedStId,
      taskId: parsedTaskId,
      subTaskName,
      taskName,
    });
  }, []);
  // Callback to show sources modal for a subtask
  const handleShowSourcesModal = useCallback(
    (sources) => {
      console.log(`Sources: ${sources}`);
      setSources(sources);
      setShowSourcesModal(true);
    },
    [setSources, setShowSourcesModal]
  );

  // --- Layout and Data Processing ---
  // Whenever graphData changes, process and layout nodes/edges
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

    // 1. Transform tasks into initial nodes for React Flow
    const initialNodes = validTasks.map((task) => ({
      id: task.id.toString(), // CRITICAL: Ensure ID is a string
      type: "taskNode",
      // Position will be set by Dagre
      position: { x: 0, y: 0 }, // Placeholder
      data: {
        id: task.id.toString(), // Ensure ID is a string
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
          labels: st.labels || [],
          skills: st.skills || [],
          sources: st.sources || "",
          completed: st.completed || false,
        })), // Pass other data for display in the node
        category: task.category,
        difficulty: task.difficulty,
        estimated_time: task.estimated_time,
        ai_impact: task.ai_impact || "",
        showSources: (sources) => handleShowSourcesModal(sources),
        onMarketAnalysis: onMarketAnalysis,
      },
    }));

    // 2. Transform dependencies into initial edges for React Flow
    const initialEdges = [];
    validTasks.forEach((task) => {
      if (task.dependencies && Array.isArray(task.dependencies)) {
        task.dependencies.forEach((depId) => {
          const sourceId = depId.toString(); // Ensure string
          const targetId = task.id.toString(); // Ensure string

          // CRITICAL: Check if both source and target nodes actually exist
          if (taskIds.has(sourceId) && taskIds.has(targetId)) {
            initialEdges.push({
              id: `e-${sourceId}-${targetId}`,
              source: sourceId,
              target: targetId,
              type: "default",
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
              },
              style: { stroke: "#3B82F6", strokeWidth: 4 },
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
  }, [graphData]); // Rerun layout when graphData changes

  // --- Render states: loading, error, empty, or graph ---
  if (loading) {
    return <DynamicLoader />;
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
      {/* Calculate total progress for all nodes */}
      <Indicators
        progress={
          (nodes.reduce((total, node) => {
            const subtasks = node.data.subtasks || [];
            const completed = subtasks.filter((st) => st.completed).length;
            return total + completed;
          }, 0) /
            nodes.reduce((total, node) => total + (node.data.subtasks?.length || 0), 0)) *
          100
        }
      />

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
        <div className='fixed left-3 bottom-6 z-20'>
          <Controls />
        </div>
        {/* <MiniMap nodeStrokeColor='#ccc' nodeColor='#fff' nodeBorderRadius={2} pannable zoomable /> */}
        <Background variant='cross' gap={15} size={1} />
      </ReactFlow>
      {/* Evaluation modal for subtask completion */}
      {evaluationModal.open && (
        <EvaluationModalUI setNodes={setNodes} evaluationModal={evaluationModal} setEvaluationModal={setEvaluationModal} />
      )}
    </div>
  );
};
import CareerPathSelector from "./CareerPathSelector";

const SkillsGraph = () => {
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [sources, setSources] = useState("");
  const [selectedPath, setSelectedPath] = useState(null);
  const { marketAnalysisData, showMarketModal, selectedSkill, handleMarketAnalysis, closeMarketModal } = useMarketAnalysis();

  const handlePathSelection = (pathObject) => {
    console.log("Selected Path Object:", pathObject);
    setSelectedPath(pathObject);
  };
  const {
    contextLoading,
    setIsPathSelected,
    isPathSelected,
    roadmap,
    setRoadmap,
    setCareerPath,
    suggestedChanges,
    setSuggestedChanges,
    updateRoadmap,
  } = useContext(SkillsContext); // State for handling the roadmap data and UI

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
          setCareerPath(selectedPath.Path_name);
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
      {" "}
      {!isPathSelected ? (
        <CareerPathSelector setIsPathSelected={setIsPathSelected} onPathSelect={handlePathSelection} />
      ) : (
        <div>
          <ReactFlowProvider>
            <SkillsGraphInternal
              setShowSourcesModal={setShowSourcesModal}
              setSources={setSources}
              graphData={graphData}
              loading={loading}
              error={error}
              onMarketAnalysis={handleMarketAnalysis}
            />
          </ReactFlowProvider>
          <InputArea
            modifyLoading={modifyLoading}
            modify={modify}
            handleSuggestionClick={handleSuggestionClick}
            showSuggestions={showSuggestions}
            suggestedChanges={suggestedChanges}
            modificationText={modificationText}
            setModificationText={setModificationText}
            setShowSuggestions={setShowSuggestions}
          />
          {showSourcesModal && (
            <div className='w-1/3 fixed top-20 right-8 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6'>
              <span className='absolute top-3 left-3'>Sources</span>
              <button className='absolute top-2 right-2 text-gray-500 hover:text-gray-700' onClick={() => setShowSourcesModal(false)}>
                ❌
              </button>
              <div className='overflow-y-auto max-h-[60vh] p-4'>
                <div dangerouslySetInnerHTML={{ __html: sources }}></div>
              </div>
            </div>
          )}
          <div className='fixed bottom-2 left-48 z-50 mb-2'>
            <button onClick={updateRoadmap} className='text-gray-200 hover:text-gray-400'>
              <span className='font-semibold'>update Roadmap</span>
              <RefreshCcw size={16} />
            </button>
          </div>
          {showMarketModal && marketAnalysisData && (
            <MarketAnalysisModal data={marketAnalysisData} skillName={selectedSkill} onClose={closeMarketModal} />
          )}
        </div>
      )}
    </>
  );
};

function InputArea({
  modifyLoading,
  modify,
  handleSuggestionClick,
  showSuggestions,
  suggestedChanges,
  modificationText,
  setModificationText,
  setShowSuggestions,
}) {
  return (
    <div className='z-50 fixed bottom-1 left-[40%] w-full max-w-2xl mx-auto px-4'>
      <div className='relative'>
        {showSuggestions && suggestedChanges.length > 0 && (
          <ul className='absolute bottom-full mb-2 w-full bg-gray-300 dark:bg-slate-300 text-black rounded-md shadow-lg z-20'>
            {suggestedChanges.map((item, i) => (
              <li key={i} onClick={() => handleSuggestionClick(item)} className='z-50 cursor-pointer px-4 py-2 hover:bg-gray-200 text-sm'>
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

function Indicators({ progress }) {
  return (
    <div className='fixed right-4 top-9 z-10 bg-white dark:bg-gray-800 rounded-md shadow-md p-3 pt-5 text-sm text-gray-800 dark:text-gray-200 flex flex-col space-y-1'>
      <div>
        <span className='font-semibold mr-2'>Priority:</span>
        <span className='inline-flex items-center space-x-1 mr-3'>
          <span className='w-12 h-5 rounded flex items-center justify-center bg-green-200 dark:bg-green-900 text-[10px] font-medium'>
            LOW
          </span>
          <span className='text-xs'>Green</span>
        </span>
        <span className='inline-flex items-center space-x-1 mr-3'>
          <span className='w-12 h-5 rounded flex items-center justify-center bg-sky-200 dark:bg-sky-900 text-[10px] font-medium'>MID</span>
          <span className='text-xs'>Blue</span>
        </span>
        <span className='inline-flex items-center space-x-1'>
          <span className='w-12 h-5 rounded flex items-center justify-center bg-red-100 dark:bg-red-900 text-[10px] font-medium'>HIGH</span>
          <span className='text-xs'>Red</span>
        </span>
      </div>

      <div>
        <span className='font-semibold mr-2'>Status:</span>
        <span className='inline-flex items-center space-x-1 mr-3'>
          <span className='w-12 h-5 rounded flex items-center justify-center border-2 border-gray-400 text-[10px] font-medium'>BASE</span>
          <span className='text-xs'>Existing</span>
        </span>
        <span className='inline-flex items-center space-x-1 mr-3'>
          <span className='w-12 h-5 rounded flex items-center justify-center border-2 border-blue-600 text-[10px] font-medium'>MOD</span>
          <span className='text-xs'>Updated</span>
        </span>
        <span className='inline-flex items-center space-x-1'>
          <span className='w-12 h-5 rounded flex items-center justify-center border-2 border-green-600 text-[10px] font-medium'>NEW</span>
          <span className='text-xs'>Added</span>
        </span>
      </div>

      <div>
        <span className='font-semibold mr-2'>Progress:</span>
        <div className='flex items-center gap-2'>
          <div className='h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
            <div className='h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500' style={{ width: `${progress}%` }} />
          </div>
          <span className='text-xs'>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
const DynamicLoader = () => {
  const loadingMessages = [
    "Loading Roadmap Graph...",
    "Analyzing Skill Gaps...",
    "Generating Personalized Career Path...",
    "Optimizing Learning Recommendations...",
    "Finalizing Task Breakdown...",
    "Preparing Visual Graph Structure...",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500); // change text every 2.5s

    return () => clearInterval(interval); // cleanup when unmounting
  }, []);

  return (
    <div className='flex justify-center items-center h-full'>
      <Atom color='#32cd32' size='large' text={loadingMessages[currentIndex]} textColor='#17d83f' />
    </div>
  );
};

export default SkillsGraph;
