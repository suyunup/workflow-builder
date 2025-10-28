import { motion, AnimatePresence } from "framer-motion";
import { useFlowStore } from "../store";
import { useState, useEffect, useRef } from "react";

export function TaskPopup() {
  const selectedNode = useFlowStore((state) => state.selectedNode);
  const nodes = useFlowStore((state) => state.nodes);
  const updateNode = useFlowStore((state) => state.updateNode);
  const selectNode = useFlowStore((state) => state.selectNode);
  const deleteNode = useFlowStore((state) => state.deleteNode);

  const node = nodes.find((n) => n.id === selectedNode);

  const [title, setTitle] = useState("");
  const [prompts, setPrompts] = useState<string[]>([""]);

  // 드래그 관련 상태
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 300,
    y: window.innerHeight / 2 - 200,
  });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (node) {
      setTitle(node.data.title);
      setPrompts(Array.isArray(node.data.prompts) ? node.data.prompts : [""]);
    }
  }, [node]);

  // 드래그 이벤트 핸들러
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (dragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    }
    function handleMouseUp() {
      setDragging(false);
    }
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, dragOffset]);

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleSave = () => {
    if (node) {
      updateNode(node.id, { title, prompts });
      selectNode(null);
    }
  };

  const handleTest = async () => {
    if (node) {
      updateNode(node.id, { status: "running" });
      // 시뮬레이션: 2초 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateNode(node.id, {
        status: "success",
        result: `테스트 실행 완료!\n\n입력 프롬프트:\n${(prompts || []).join("\n---\n")}\n\n처리 결과:\n[AI가 생성한 결과 예시]`,
      });
    }
  };

  const handleDelete = () => {
    if (node && confirm("이 Task를 삭제하시겠습니까?")) {
      deleteNode(node.id);
      selectNode(null);
    }
  };

  if (!node) return null;

  return (
    <AnimatePresence>
      {selectedNode && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => selectNode(null)}
          />

          {/* 팝업 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              left: position.x,
              top: position.y,
              position: "fixed",
              zIndex: 50,
              width: 600,
              maxHeight: "80vh",
            }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between cursor-move select-none"
              onMouseDown={handleHeaderMouseDown}
            >
              <h2 className="text-white font-semibold text-lg">Task 설정</h2>
              <button
                onClick={() => selectNode(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              {/* Task 이름 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task 이름
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Task 이름을 입력하세요"
                />
              </div>

              {/* 프롬프트 입력 (다중) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  아이템
                </label>
                <div className="flex flex-col gap-3">
                  {prompts.map((value, idx) => (
                    <AutoResizeTextarea
                      key={idx}
                      initialValue={value}
                      onChange={(val) =>
                        setPrompts((prev) => {
                          const next = [...prev];
                          next[idx] = val;
                          return next;
                        })
                      }
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setPrompts((prev) => [...prev, ""])}
                    className="self-start px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    생성
                  </button>
                </div>
              </div>

              {/* 결과 출력 */}
              {node.data.result && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    실행 결과
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 whitespace-pre-wrap min-h-[100px]">
                    {node.data.result}
                  </div>
                </div>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
              >
                삭제
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleTest}
                  disabled={node.data.status === "running"}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {node.data.status === "running"
                    ? "실행 중..."
                    : "테스트 실행"}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                >
                  저장
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const AutoResizeTextarea = ({
  onChange,
  initialValue = "",
}: {
  onChange: (value: string) => void;
  initialValue?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * 10;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  };

  // 초기값 반영 및 높이 계산
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.value = initialValue ?? "";
    textarea.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * 10;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  }, [initialValue]);

  return (
    <textarea
      ref={textareaRef}
      onInput={handleInput}
      rows={4}
      placeholder="내용을 입력해주세요"
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full
        resize-none
        overflow-y-auto
        p-3
        text-base
        rounded-md
        border
        border-gray-300
        focus:outline-none
        focus:ring-2
        focus:ring-blue-400
        leading-relaxed
        transition-all
        duration-150
        ease-in-out
        placeholder:text-gray-400
        scrollbar-thin
        scrollbar-thumb-gray-300
        scrollbar-track-transparent
      "
      value={initialValue}
    />
  );
};
