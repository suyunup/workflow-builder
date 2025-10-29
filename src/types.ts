import { Node, Edge } from "reactflow";

export interface TaskData {
  id: string;
  title: string;
  prompts: string[];
  result: string;
  status: "idle" | "running" | "success" | "error";
  selected: boolean;
}

export interface TaskEdge extends Edge {
  sourceHandle?: string;
  targetHandle?: string;
}

export type TaskNode = Node<TaskData>;

export interface FlowState {
  nodes: TaskNode[];
  edges: Edge[];
  selectedNode: string | null;
  addNode: (position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<TaskData>) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: TaskNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (id: string | null) => void;
  saveFlow: () => void;
  loadFlow: () => void;
  clearFlow: () => void;
  executeFlow: () => Promise<void>;
}

declare global {
  interface Window {
    isResizingNode?: boolean;
  }
}
