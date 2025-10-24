import { memo, useRef, useState } from "react";
import {
  Handle,
  NodeProps,
  NodeResizeControl,
  NodeResizer,
  Position,
} from "reactflow";
import { TaskData } from "../types";
import { useFlowStore } from "../store";

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#686ad2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "absolute", right: 5, bottom: 5 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}

export const TaskNode = memo(({ id, data }: NodeProps<TaskData>) => {
  const selectNode = useFlowStore((state) => state.selectNode);

  const [size, setSize] = useState({ width: 220, height: 140 });

  const handleResize = (e: { dx: number; dy: number }) => {
    setSize((prev) => ({
      width: Math.max(180, prev.width + e.dx),
      height: Math.max(100, prev.height + e.dy),
    }));
  };

  // // 리사이즈 상태 관리
  // const resizingRef = useRef(false);
  // const lastPosRef = useRef({ x: 0, y: 0 });

  // // 리사이즈 핸들 이벤트
  // const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
  //   console.log("Resize Mouse Down");
  //   e.stopPropagation();
  //   e.preventDefault();
  //   if (
  //     e.nativeEvent &&
  //     typeof e.nativeEvent.stopImmediatePropagation === "function"
  //   ) {
  //     e.nativeEvent.stopImmediatePropagation();
  //   }
  //   resizingRef.current = true;
  //   lastPosRef.current = { x: e.clientX, y: e.clientY };
  //   window.addEventListener("mousemove", handleResizeMouseMove);
  //   window.addEventListener("mouseup", handleResizeMouseUp);
  // };
  // window.isResizingNode = false; // Initialize the flag

  // const handleResizeMouseMove = (e: MouseEvent) => {
  //   if (!resizingRef.current) return;
  //   const dx = e.clientX - lastPosRef.current.x;
  //   const dy = e.clientY - lastPosRef.current.y;

  //   lastPosRef.current = { x: e.clientX, y: e.clientY };
  // };

  // const handleResizeMouseUp = () => {
  //   resizingRef.current = false;
  //   window.removeEventListener("mousemove", handleResizeMouseMove);
  //   window.removeEventListener("mouseup", handleResizeMouseUp);
  // };

  const getStatusColor = () => {
    switch (data.status) {
      case "running":
        return "bg-yellow-400";
      case "success":
        return "bg-green-400";
      case "error":
        return "bg-red-400";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case "running":
        return (
          <svg
            className="animate-spin h-4 w-4 text-yellow-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      case "success":
        return (
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="h-4 w-4 text-red-600"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return "+";
    }
  };

  return (
    <div
      className="task-node bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-400 transition-colors flex flex-col"
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
      }}
    >
      {/* 상단 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ left: -6 }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ right: -6 }}
      />

      <NodeResizeControl
        style={{
          background: "transparent",
          border: "none",
        }}
        onResize={handleResize}
        minWidth={100}
        minHeight={50}
      >
        <ResizeIcon />
      </NodeResizeControl>
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm truncate flex-1">
          {data.title}
        </h3>
        <div
          className="flex items-center justify-center w-6 h-6 hover:border hover:border-blue-500 rounded-full duration-200 transition-all"
          onClick={() => selectNode(id)}
        >
          {getStatusIcon()}
        </div>
      </div>

      {/* 본문 */}
      <div className="px-4 py-3 flex-1">
        <p className="text-xs text-gray-500 whitespace-pre-line">
          {data.prompt || "프롬프트를 입력해주세요"}
        </p>
      </div>

      {/* 상태 표시 */}
      <div className="px-4 py-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs text-gray-400 capitalize">{data.status}</span>
      </div>
    </div>
  );
});

TaskNode.displayName = "TaskNode";
