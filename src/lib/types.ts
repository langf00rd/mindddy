export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "text" | "image" | "audio" | "video";
  content?: string;
}

export interface FlowEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface DrawingLine {
  fromNodeId: string;
  toX: number;
  toY: number;
}

export interface Node {
  id: number;
  x: number;
  y: number;
  type: "text" | "image" | "audio" | "video";
  content: string | null;
  text: string | null;
  width: number;
  height: number;
}

export interface NodeConnection {
  id: string;
  from: number;
  to: number;
}

export interface NodeConnectionLineProps {
  nodes: Node[];
  connections: NodeConnection[];
  connectingFrom: number | null;
  tempLine: { x: number; y: number } | null;
  getNodeCenter: (node: Node) => { x: number; y: number };
}

export interface NodeItemProps {
  node: Node;
  handleMouseDown: (e: React.MouseEvent, node: Node) => void;
  deleteNode: (id: number) => void;
  handleMediaUpload: (id: number, type: Node["type"]) => void;
  renderNodeContent: (node: Node) => React.ReactNode;
  startConnection: (e: React.MouseEvent, nodeId: number) => void;
  endConnection: (e: React.MouseEvent, nodeId: number) => void;
}
