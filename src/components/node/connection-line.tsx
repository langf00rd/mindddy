import { NodeConnectionLineProps } from "@/lib/types";

export default function NodeConnectionLine(props: NodeConnectionLineProps) {
  const { nodes, connections, connectingFrom, tempLine, getNodeCenter } = props;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
          <polygon points="0 0, 10 3, 0 6" fill="#ccc" />
        </marker>
      </defs>

      {connections.map((conn) => {
        const from = nodes.find((n) => n.id === conn.from);
        const to = nodes.find((n) => n.id === conn.to);
        if (!from || !to) return null;
        const start = getNodeCenter(from);
        const end = getNodeCenter(to);
        // shorten line so arrow doesn't overlap node
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const shorten = 10;
        const endX = end.x - (dx / length) * shorten;
        const endY = end.y - (dy / length) * shorten;
        return (
          <line
            key={conn.id}
            x1={start.x}
            y1={start.y}
            x2={endX - 100}
            y2={endY - 100}
            stroke="#ccc"
            strokeWidth={1}
            markerEnd="url(#arrowhead)"
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
              stroke="#ccc"
              strokeWidth={1}
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)"
            />
          );
        })()}
    </svg>
  );
}
