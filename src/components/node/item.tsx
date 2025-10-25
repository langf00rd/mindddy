import { NodeItemProps } from "@/lib/types";
import { Button } from "../ui/button";

export default function NodeItem(props: NodeItemProps) {
  const {
    node,
    handleMouseDown,
    deleteNode,
    handleMediaUpload,
    renderNodeContent,
    startConnection,
    endConnection,
  } = props;
  return (
    <div
      onMouseDown={(e) => handleMouseDown(e, node)}
      className="absolute bg-neutral-100 border group cursor-grab"
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(node.id);
        }}
        className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100"
      >
        ×
      </Button>

      {/* Node content */}
      <div
        className="w-full h-full overflow-hidden"
        onClick={(e) => {
          if (!node.content && node.type !== "text") {
            e.stopPropagation();
            handleMediaUpload(node.id, node.type);
          }
        }}
      >
        {renderNodeContent(node)}
      </div>

      {/* Connection points */}
      {["top", "right", "bottom", "left"].map((pos) => (
        <div
          key={pos}
          className={`connection-point opacity-0 group-hover:opacity-100 absolute size-3 rounded-full bg-neutral-400 border border-white hover:bg-primary-400 cursor-crosshair ${
            pos === "left"
              ? "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
              : pos === "right"
                ? "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
                : pos === "top"
                  ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  : "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
          }`}
          onMouseDown={(e) => startConnection(e, node.id)}
          onMouseUp={(e) => endConnection(e, node.id)}
        />
      ))}
    </div>
  );
}
