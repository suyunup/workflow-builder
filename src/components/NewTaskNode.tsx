import React, { useState, useEffect } from "react";
import {
  Handle,
  Position,
  NodeResizer,
  useReactFlow,
  useUpdateNodeInternals,
  NodeResizeControl,
} from "reactflow";
import "reactflow/dist/style.css";

export const NewTaskNode = ({ id, data, selected }: any) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 200, height: 120 });
  const updateNodeInternals = useUpdateNodeInternals();

  // 사이즈 변경될 때마다 React Flow에 알려줘야 함
  useEffect(() => {
    updateNodeInternals(id);
  }, [size, id, updateNodeInternals]);

  return (
    <>
      {/* 리사이즈 핸들 */}
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

      {/* 상단 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ left: -6 }}
      />

      {/* Output 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ right: -6 }}
      />

      {/* <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm truncate flex-1">
          {data.title || "제목 없음"}
        </h3>
        <span className="text-xs text-gray-400">⚙️</span>
      </div>

      <div className="px-3 py-2 flex-1 overflow-auto">
        <p className="text-xs text-gray-500 whitespace-pre-line">
          {data.prompt || "프롬프트를 입력해주세요"}
        </p>
      </div>

      <div className="px-3 py-2 flex items-center gap-2 border-t border-gray-100">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-xs text-gray-400 capitalize">
          {data.status || "idle"}
        </span>
      </div> */}
    </>
  );
};
