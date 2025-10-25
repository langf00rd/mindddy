import { NodeConnectionLineProps } from "@/lib/types";

export default function NodeConnectionLine({
  nodes,
  connections,
  connectingFrom,
  tempLine,
  getNodeCenter,
  selectedConnection,
  onSelectConnection,
}: NodeConnectionLineProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full cursor-pointer"
      style={{ pointerEvents: "auto" }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#eee" />
        </marker>
      </defs>

      {connections.map((conn) => {
        const from = nodes.find((n) => n.id === conn.from);
        const to = nodes.find((n) => n.id === conn.to);
        if (!from || !to) return null;

        const start = getNodeCenter(from);
        const end = getNodeCenter(to);

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const shorten = 10;
        const endX = end.x - (dx / length) * shorten;
        const endY = end.y - (dy / length) * shorten;

        const isSelected = selectedConnection === conn.id;

        return (
          <line
            key={conn.id}
            x1={start.x}
            y1={start.y}
            x2={endX}
            y2={endY}
            stroke={isSelected ? "#000" : "#eee"}
            strokeWidth={1}
            markerEnd="url(#arrowhead)"
            pointerEvents="stroke"
            onClick={(e) => {
              e.stopPropagation();
              onSelectConnection?.(conn.id);
            }}
          />
        );
      })}

      {tempLine &&
        connectingFrom !== null &&
        (() => {
          const from = nodes.find((n) => n.id === connectingFrom);
          if (!from) return null;
          const start = getNodeCenter(from);
          return (
            <line
              x1={start.x}
              y1={start.y}
              x2={tempLine.x}
              y2={tempLine.y}
              stroke="#000"
              strokeWidth={1}
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)"
            />
          );
        })()}
    </svg>
  );
}
