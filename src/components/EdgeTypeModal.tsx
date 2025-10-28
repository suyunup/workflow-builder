import React, { useEffect, useState } from "react";
import { EdgeTypeModalProps, NodeType } from "./types";

type EdgeTypeModalPropsWithDelete = EdgeTypeModalProps & {
  onDelete?: () => void;
};

export const EdgeTypeModal: React.FC<EdgeTypeModalPropsWithDelete> = ({
  open,
  edge,
  nodes,
  onClose,
  onApply,
  onDelete,
}) => {
  const [sourceType, setSourceType] = useState<NodeType>("input");
  const [targetType, setTargetType] = useState<NodeType>("output");

  useEffect(() => {
    if (edge) {
      setSourceType("input");
      setTargetType("output");
    }
  }, [edge, nodes, open]);

  if (!open || !edge) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">노드 타입 변경</h3>

        <div className="flex flex-col gap-3">
          <label>
            Source 타입:
            <select
              value={sourceType}
              onChange={(e) => {
                const value = e.target.value as NodeType;
                setSourceType(value);
                if (value === "input") setTargetType("output");
                else if (value === "output") setTargetType("input");
              }}
              className="border p-1 rounded w-full"
            >
              <option value="input">input</option>
              <option value="output">output</option>
            </select>
          </label>

          <label>
            Target 타입:
            <select
              value={targetType}
              onChange={(e) => {
                const value = e.target.value as NodeType;
                setTargetType(value);
                if (value === "input") setSourceType("output");
                else if (value === "output") setSourceType("input");
              }}
              className="border p-1 rounded w-full"
            >
              <option value="input">input</option>
              <option value="output">output</option>
            </select>
          </label>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
            >
              취소
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-white rounded bg-red-400 hover:bg-red-500"
            >
              삭제
            </button>
            <button
              onClick={() => onApply(sourceType, targetType)}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
