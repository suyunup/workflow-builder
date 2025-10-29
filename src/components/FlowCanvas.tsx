import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  useReactFlow,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useFlowStore } from "../store";
import { TaskNode } from "./TaskNode";
import { TaskPopup } from "./TaskPopup";
import { NodeType } from "./types";
import { EdgeTypeModal } from "./EdgeTypeModal";

const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
};

export function FlowCanvas() {
  const { fitView } = useReactFlow();
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);
  const addNode = useFlowStore((state) => state.addNode);
  const saveFlow = useFlowStore((state) => state.saveFlow);
  const loadFlow = useFlowStore((state) => state.loadFlow);
  const clearFlow = useFlowStore((state) => state.clearFlow);
  const executeFlow = useFlowStore((state) => state.executeFlow);

  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadFlow();
  }, [loadFlow]);

  useEffect(() => {
    if (nodes.length > 0) {
      saveFlow();
    }
  }, [nodes, edges, saveFlow]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // 순환 연결 방지
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      // 같은 노드끼리 연결 방지
      if (params.source === params.target) return;

      // 이미 연결되어 있는지 확인 (핸들 정보도 고려)
      const alreadyConnected = edges.some(
        (edge) =>
          edge.source === params.source &&
          edge.target === params.target &&
          edge.sourceHandle === params.sourceHandle &&
          edge.targetHandle === params.targetHandle
      );

      if (alreadyConnected) return;

      setEdges(
        addEdge(
          {
            ...params,
            type: "step",
            animated: false,
            style: { stroke: "#007AFF", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#007aff" },
            // 핸들 정보 저장
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
          },
          edges
        )
      );
    },
    [nodes, edges, setEdges]
  );

  const onNodesChange = useCallback(
    (changes: any) => {
      const updatedNodes = changes.reduce((acc: any[], change: any) => {
        if (change.type === "position" && change.dragging) {
          return acc.map((node) =>
            node.id === change.id
              ? { ...node, position: change.position }
              : node
          );
        }
        if (change.type === "remove") {
          return acc.filter((node) => node.id !== change.id);
        }
        return acc;
      }, nodes);
      setNodes(updatedNodes);
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      const updatedEdges = changes.reduce((acc: Edge[], change: any) => {
        if (change.type === "remove") {
          return acc.filter((edge) => edge.id !== change.id);
        }
        return acc;
      }, edges);
      setEdges(updatedEdges);
    },
    [edges, setEdges]
  );

  const handleAddNode = () => {
    const center = {
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight / 2 - 100,
    };
    addNode(center);
  };

  const handleExecute = async () => {
    await executeFlow();
  };

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setModalOpen(true);
  }, []);

  const handleApply = (sourceType: NodeType, targetType: NodeType) => {
    if (!selectedEdge) return;

    let newSource = selectedEdge.source;
    let newTarget = selectedEdge.target;

    let newHandleSource = selectedEdge.sourceHandle;
    let newHandleTarget = selectedEdge.targetHandle;

    // input/output에 따라 방향 재설정
    if (sourceType === "output" && targetType === "input") {
      // 방향 뒤집기
      newSource = selectedEdge.target;
      newTarget = selectedEdge.source;
      newHandleSource = selectedEdge.targetHandle;
      newHandleTarget = selectedEdge.sourceHandle;
    }
    // input→output, output→input만 뒤집고, 나머지는 그대로

    // Handle ID 변환: in-0 ↔ out-0, in-1 ↔ out-1 등
    const convertHandleId = (
      handleId: string | null | undefined,
      fromType: string,
      toType: string
    ) => {
      if (!handleId) return handleId;

      // in-0, out-1 등의 패턴 매칭
      const match = handleId.match(/^(in|out)-(\d+)$/);
      if (match) {
        const [, currentType, index] = match;
        if (currentType === fromType) {
          return `${toType}-${index}`;
        }
      }
      return handleId;
    };

    // Handle ID 변환 적용
    newHandleSource = convertHandleId(newHandleSource, "in", "out");
    newHandleTarget = convertHandleId(newHandleTarget, "out", "in");

    setEdges(
      edges.map((e) =>
        e.id === selectedEdge.id
          ? {
              ...e,
              source: newSource,
              target: newTarget,
              sourceHandle: newHandleSource,
              targetHandle: newHandleTarget,
              markerEnd: { type: MarkerType.ArrowClosed, color: "#007aff" },
            }
          : e
      )
    );

    setSelectedEdge(null);
    setModalOpen(false);
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      {/* 툴바 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={handleAddNode}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Task 추가
        </button>

        <button
          onClick={handleExecute}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          플로우 실행
        </button>

        <button
          onClick={clearFlow}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          초기화
        </button>
      </div>

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={handleEdgeClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
        fitView
        minZoom={0.5}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "custom",
          animated: false,
        }}
      >
        <Background color="#E5E7EB" gap={16} />
        <Controls className="bg-white rounded-lg shadow-md" />
        <MiniMap
          className="bg-white rounded-lg shadow-md"
          nodeColor={(node) => {
            switch (node.data.status) {
              case "running":
                return "#FCD34D";
              case "success":
                return "#34D399";
              case "error":
                return "#F87171";
              default:
                return "#E5E7EB";
            }
          }}
        />
      </ReactFlow>

      {/* 팝업 */}
      <TaskPopup />
      <EdgeTypeModal
        open={isModalOpen}
        edge={selectedEdge}
        nodes={nodes}
        onClose={() => setModalOpen(false)}
        onApply={handleApply}
        onDelete={() => {
          if (!selectedEdge) return;
          setEdges(edges.filter((e) => e.id !== selectedEdge.id));
          setSelectedEdge(null);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
