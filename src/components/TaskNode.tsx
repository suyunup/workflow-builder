import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  Fragment,
} from "react";
import { Handle, NodeProps, NodeResizer, Position } from "reactflow";
import { TaskData } from "../types";
import { useFlowStore } from "../store";

export const TaskNode = memo(({ id, data, selected }: NodeProps<TaskData>) => {
  const selectNode = useFlowStore((state) => state.selectNode);

  const [size, setSize] = useState({ width: 220, height: 140 });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const [availableLines, setAvailableLines] = useState<number>(3);
  const [lineHeightPx, setLineHeightPx] = useState<number>(16);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [itemHandleTops, setItemHandleTops] = useState<number[]>([]);

  const handleResize = (e: { dx: number; dy: number }) => {
    setSize((prev) => ({
      width: Math.max(180, prev.width + e.dx),
      height: Math.max(100, prev.height + e.dy),
    }));
  };

  // 본문 라인 높이 및 사용 가능한 라인 수 계산
  useLayoutEffect(() => {
    const bodyEl = bodyRef.current;
    const headerEl = headerRef.current;
    const statusEl = statusRef.current;
    if (!bodyEl || !headerEl || !statusEl) return;

    const bodyStyle = getComputedStyle(bodyEl);
    const lh = parseFloat(bodyStyle.lineHeight || "16");
    const effectiveLh = isFinite(lh) && lh > 0 ? lh : 16;
    setLineHeightPx(effectiveLh);

    const padTop = parseFloat(bodyStyle.paddingTop || "0");
    const padBottom = parseFloat(bodyStyle.paddingBottom || "0");

    // 아이템 크롬(패딩/보더) 및 gap 측정
    const listEl = listRef.current;
    const rowGap = listEl
      ? parseFloat(
          getComputedStyle(listEl).rowGap || getComputedStyle(listEl).gap || "0"
        )
      : 0;
    const firstItem = listEl?.firstElementChild as HTMLElement | null;
    let itemChrome = 0;
    if (firstItem) {
      const itemStyle = getComputedStyle(firstItem);
      const pt = parseFloat(itemStyle.paddingTop || "0");
      const pb = parseFloat(itemStyle.paddingBottom || "0");
      const bt = parseFloat(itemStyle.borderTopWidth || "0");
      const bb = parseFloat(itemStyle.borderBottomWidth || "0");
      itemChrome = pt + pb + bt + bb;
    } else {
      // Tailwind border p-2 기본값 추정: paddingY=16px, borderY=2px
      itemChrome = 18;
    }

    const headerH = headerEl.getBoundingClientRect().height;
    const statusH = statusEl.getBoundingClientRect().height;
    const totalH = size.height;
    const n = data.prompts?.length || 0;
    const nonTextChrome =
      n > 0 ? n * itemChrome + Math.max(0, n - 1) * rowGap : 0;

    const contentH = Math.max(
      0,
      totalH - headerH - statusH - padTop - padBottom - 2 /* borders gap */
    );

    const linesBudget = Math.max(
      0,
      Math.floor((contentH - nonTextChrome) / effectiveLh)
    );
    setAvailableLines(linesBudget);
  }, [size.height, size.width, data.prompts]);

  // 아이템당 최소 1라인 보장되도록 최소 높이 자동 조정
  useEffect(() => {
    const n = data.prompts?.length || 0;
    if (n <= 0) return;
    const headerH = headerRef.current?.getBoundingClientRect().height || 0;
    const statusH = statusRef.current?.getBoundingClientRect().height || 0;
    const bodyStyle = bodyRef.current
      ? getComputedStyle(bodyRef.current)
      : null;
    const padTop = bodyStyle ? parseFloat(bodyStyle.paddingTop || "0") : 0;
    const padBottom = bodyStyle
      ? parseFloat(bodyStyle.paddingBottom || "0")
      : 0;
    const listEl = listRef.current;
    const rowGap = listEl
      ? parseFloat(
          getComputedStyle(listEl).rowGap || getComputedStyle(listEl).gap || "0"
        )
      : 0;
    const firstItem = listEl?.firstElementChild as HTMLElement | null;
    let itemChrome = 0;
    if (firstItem) {
      const itemStyle = getComputedStyle(firstItem);
      const pt = parseFloat(itemStyle.paddingTop || "0");
      const pb = parseFloat(itemStyle.paddingBottom || "0");
      const bt = parseFloat(itemStyle.borderTopWidth || "0");
      const bb = parseFloat(itemStyle.borderBottomWidth || "0");
      itemChrome = pt + pb + bt + bb;
    } else {
      itemChrome = 18; // fallback
    }
    const minH = Math.ceil(
      headerH +
        statusH +
        padTop +
        padBottom +
        n * (lineHeightPx + itemChrome) +
        Math.max(0, n - 1) * rowGap +
        2 /* borders gap */
    );
    if (size.height < minH) {
      setSize((prev) => ({ ...prev, height: minH }));
    }
  }, [data.prompts, lineHeightPx]);

  // 각 아이템의 중앙 Y 좌표(노드 컨테이너 기준) 계산
  useLayoutEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const rootRect = rootEl.getBoundingClientRect();
    const tops = (itemRefs.current || []).map((el) => {
      if (!el) return 0;
      const itemRect = el.getBoundingClientRect();
      const centerY = itemRect.top + itemRect.height / 2;
      return centerY - rootRect.top; // 노드 루트 기준 Y
    });
    setItemHandleTops(tops);
  }, [data.prompts, size.height, size.width, availableLines]);

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
      ref={rootRef}
      className="task-node bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-400 transition-colors flex flex-col"
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
      }}
    >
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        onResize={handleResize}
        minWidth={100}
        minHeight={30}
      />
      {/* 기존 고정 핸들 유지 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-blue-500 border-2 border-white"
        style={{ top: "30px", left: -9 }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-green-500 border-2 border-white"
        style={{ top: "30px", right: -9 }}
      />

      {/* 아이템별 핸들 (좌/우) */}
      {itemHandleTops.map((top, idx) => (
        <Fragment key={`frag-${idx}`}>
          <Handle
            id={`in-${idx}`}
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-blue-500 border-2 border-white rounded-none"
            style={{ top: top - 6, left: -6 }}
          />
          <Handle
            id={`out-${idx}`}
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-green-500 border-2 border-white rounded-none"
            style={{ top: top - 6, right: -6 }}
          />
        </Fragment>
      ))}

      {/* 헤더 */}
      <div
        ref={headerRef}
        className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
      >
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
      <div ref={bodyRef} className="px-4 py-3 flex-1 overflow-hidden">
        {data.prompts && data.prompts.length > 0 ? (
          <div ref={listRef} className="flex flex-col gap-2">
            {(() => {
              const prompts = data.prompts || [];
              const n = prompts.length;
              const minLines = n; // 아이템당 최소 1줄
              const extra = Math.max(0, availableLines - minLines);
              const allocations = new Array(n).fill(1);
              for (let i = 0; i < extra; i++) {
                allocations[i % n] += 1; // 위에서부터 라운드로빈 배분
              }
              return prompts.map((p, idx) => (
                <LineClampText
                  key={idx}
                  ref={(el: HTMLDivElement | null) =>
                    (itemRefs.current[idx] = el)
                  }
                  text={p}
                  lines={allocations[idx]}
                />
              ));
            })()}
          </div>
        ) : (
          <p className="text-xs text-gray-400">프롬프트를 입력해주세요</p>
        )}
      </div>

      {/* 상태 표시 */}
      <div ref={statusRef} className="px-4 py-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs text-gray-400 capitalize">{data.status}</span>
      </div>
    </div>
  );
});

TaskNode.displayName = "TaskNode";

const LineClampText = forwardRef<
  HTMLDivElement,
  { text: string; lines: number }
>(({ text, lines }, ref) => {
  return (
    <div ref={ref} className="border p-2 bg-gray-50 rounded">
      <div
        className="text-xs text-gray-600 break-all"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical" as any,
          overflow: "hidden",
          whiteSpace: "normal",
          wordBreak: "break-word",
          lineHeight: "inherit",
        }}
        title={text}
      >
        {text}
      </div>
    </div>
  );
});
