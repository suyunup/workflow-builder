import { EdgeProps, getBezierPath } from "reactflow";
import { motion } from "framer-motion";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 2 L 10 5 L 0 8 Z" fill="#007AFF" />
        </marker>
      </defs>
      {/* 배경 경로 (hover 효과용) */}
      <path
        id={`${id}-bg`}
        style={{
          ...style,
          strokeWidth: 12,
          stroke: "transparent",
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />

      {/* 메인 경로 */}
      <motion.path
        id={id}
        style={style}
        className="custom-edge-path"
        d={edgePath}
        markerEnd="url(#arrow)"
        initial={{ pathLength: 0, strokeWidth: 4 }}
        animate={{ pathLength: 1, strokeWidth: 2 }}
        transition={{
          pathLength: { duration: 0.5, ease: "easeInOut" },
          strokeWidth: { duration: 0.3, delay: 0.5, ease: "easeInOut" },
        }}
      />
    </>
  );
}
