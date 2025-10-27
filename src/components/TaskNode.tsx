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

export const TaskNode = memo(({ id, data, selected }: NodeProps<TaskData>) => {
  const selectNode = useFlowStore((state) => state.selectNode);

  const [size, setSize] = useState({ width: 220, height: 140 });
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleResizeStart = (e: any) => {
    setStartPos({ x: e.dx, y: e.dy });
    setSize(size);
  };

  const handleResize = (e: any) => {
    if (!startPos) return;

    const dx = e.dx - startPos.x;
    const dy = e.dy - startPos.y;

    setSize({
      width: Math.max(180, size.width + dx),
      height: Math.max(100, size.height + dy),
    });
  };
  const handleResizeEnd = () => {
    setStartPos(null);
  };

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

      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        minWidth={100}
        minHeight={30}
      />
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
