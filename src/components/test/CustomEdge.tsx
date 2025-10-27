import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeText,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  label,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const activeMarkerEnd = selected ? "url(#selected-marker)" : markerEnd;

  const color = selected ? "#FFCC00" : style.stroke;

  return (
    <>
      {/* You can also define a custom marker in your own Custom Edge component. 
      This might be useful if you want to have a different marker, depending on the state of the edge.
      Ideally, you would store the marker definition in a separate component, so you can reuse it in multiple edges.
      If you defined it here, in your custom edge component, it will be re-rendered for every edge instance.
      */}
      <svg style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <marker
            className="react-flow__arrowhead"
            id="selected-marker"
            markerWidth="20"
            markerHeight="20"
            viewBox="-10 -10 20 20"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
            refX="0"
            refY="0"
          >
            <polyline
              className="arrowclosed"
              style={{
                strokeWidth: 1,
                stroke: "#FFCC00",
                fill: "#FFCC00",
              }}
              strokeLinecap="round"
              strokeLinejoin="round"
              points="-5,-4 0,0 -5,4 -5,-4"
            />
          </marker>
        </defs>
      </svg>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={activeMarkerEnd}
        style={{ stroke: color, ...style }}
        label={label}
      />

      <EdgeText x={labelX} y={labelY} label={label} />
    </>
  );
};
