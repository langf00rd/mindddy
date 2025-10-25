import { NodeItemProps } from "@/lib/types";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "../ui/button";

export default function NodeItem(props: NodeItemProps) {
  return (
    <div className="group">
      <div
        onMouseDown={(e) => props.handleMouseDown(e, props.node)}
        className="absolute bg-white min-h-[100px] h-fit flex-col flex items-center justify-center shadow-xs border group-hover:p-1 transition-all cursor-grab"
        style={{
          left: props.node.x,
          top: props.node.y,
          width: props.node.width,
        }}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            props.deleteNode(props.node.id);
          }}
          className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100"
        >
          ×
        </Button>

        {/* ---- node content ---- */}
        <div
          className="w-full h-full overflow-hidden"
          onClick={(e) => {
            if (!props.node.content && props.node.type !== "text") {
              e.stopPropagation();
              props.handleMediaUpload(props.node.id, props.node.type);
            }
          }}
        >
          {props.renderNodeContent(props.node)}
        </div>

        {/* ---- connection points ---- */}
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
            onMouseDown={(e) => props.startConnection(e, props.node.id)}
            onMouseUp={(e) => props.endConnection(e, props.node.id)}
          />
        ))}

        <div className="hidden pt-1 group-hover:flex items-center gap-2 text-sm text-neutral-400 font-medium">
          {props.connectionsCount.in > 0 && (
            <p className="flex items-center">
              <ArrowDown size={16} />
              {props.connectionsCount.in}
            </p>
          )}
          {props.connectionsCount.in && props.connectionsCount.in ? (
            <p>•</p>
          ) : null}
          {props.connectionsCount.out > 0 && (
            <p className="flex items-center">
              <ArrowUp size={16} />
              {props.connectionsCount.out}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
