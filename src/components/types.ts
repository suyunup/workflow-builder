import { Edge, Node } from "reactflow";

export type NodeType = "input" | "output";

export interface EdgeTypeModalProps {
  open: boolean;
  edge: Edge | null;
  nodes: Node[];
  onClose: () => void;
  onApply: (sourceType: NodeType, targetType: NodeType) => void;
}
