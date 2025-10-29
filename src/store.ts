import { create } from 'zustand';
import { Edge } from 'reactflow';
import { FlowState, TaskNode, TaskData } from './types';

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,

  addNode: (position) => {
    const newNode: TaskNode = {
      id: `task-${Date.now()}`,
      type: 'taskNode',
      position,
      data: {
        id: `task-${Date.now()}`,
        title: '새 Task',
        prompts: [''],
        result: '',
        status: 'idle',
        selected: false,
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } as TaskData }
          : node
      ),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    }));
  },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  selectNode: (id) => set({ selectedNode: id }),

  saveFlow: () => {
    const { nodes, edges } = get();
    localStorage.setItem('workflow-flow', JSON.stringify({ nodes, edges }));
  },

  loadFlow: () => {
    const saved = localStorage.getItem('workflow-flow');
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      set({ nodes, edges });
    }
  },

  clearFlow: () => {
    set({ nodes: [], edges: [], selectedNode: null });
    localStorage.removeItem('workflow-flow');
  },

  executeFlow: async () => {
    const { nodes, edges } = get();
    
    // 시작 노드 찾기 (incoming edge가 없는 노드)
    const startNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    );

    // 각 노드를 순차적으로 실행
    for (const startNode of startNodes) {
      await executeNodeRecursively(startNode.id, get, set);
    }
  },
}));

// 재귀적으로 노드 실행
async function executeNodeRecursively(
  nodeId: string,
  get: () => FlowState,
  set: (partial: Partial<FlowState>) => void,
  inputData?: { [handleId: string]: string }
) {
  const { nodes, edges, updateNode } = get();
  const node = nodes.find((n) => n.id === nodeId);
  
  if (!node || node.data.status === 'running') return;

  // 실행 상태로 변경
  updateNode(nodeId, { status: 'running' });

  // 시뮬레이션: 2초 대기
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 입력 데이터 처리
  let processedPrompts = [...(node.data.prompts || [])];
  
  if (inputData) {
    // 각 아이템에 대해 입력 데이터 적용
    Object.entries(inputData).forEach(([handleId, value]) => {
      // handleId가 "in-{index}" 형태인 경우 해당 인덱스의 프롬프트 업데이트
      const match = handleId.match(/^in-(\d+)$/);
      if (match) {
        const index = parseInt(match[1]);
        if (index < processedPrompts.length) {
          processedPrompts[index] = value;
        }
      }
    });
  }

  // 성공 상태로 변경 및 결과 저장
  updateNode(nodeId, {
    status: 'success',
    result: `${node.data.title} 실행 완료\n입력: ${processedPrompts.join('\n---\n')}\n출력: [처리된 결과]`,
  });

  // 연결된 다음 노드 찾기
  const nextEdges = edges.filter((edge) => edge.source === nodeId);
  
  // 다음 노드들을 순차적으로 실행
  for (const edge of nextEdges) {
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!targetNode) continue;

    // 출력 데이터 준비
    const outputData: { [handleId: string]: string } = {};
    const edgeWithHandles = edge as Edge & { sourceHandle?: string; targetHandle?: string };
    
    if (edgeWithHandles.sourceHandle) {
      // sourceHandle이 "out-{index}" 형태인 경우 해당 아이템 값을 전달
      const match = edgeWithHandles.sourceHandle.match(/^out-(\d+)$/);
      if (match) {
        const index = parseInt(match[1]);
        if (index < processedPrompts.length) {
          outputData[edgeWithHandles.targetHandle || 'default'] = processedPrompts[index];
        }
      } else {
        // 고정 핸들인 경우 모든 아이템 내용 전달
        outputData[edgeWithHandles.targetHandle || 'default'] = processedPrompts.join('\n---\n');
      }
    } else {
      // 핸들 정보가 없는 경우 모든 아이템 내용 전달
      outputData[edgeWithHandles.targetHandle || 'default'] = processedPrompts.join('\n---\n');
    }

    await executeNodeRecursively(edge.target, get, set, outputData);
  }
}
