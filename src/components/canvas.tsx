"use client";

import { Node, NodeConnection } from "@/lib/types";
import { getCurrentDate } from "@/lib/utils";
import {
  Download,
  ImageIcon,
  Music,
  PlusIcon,
  Trash2,
  Type,
  Upload,
  Video,
} from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import NodeConnectionLine from "./node/connection-line";
import NodeItem from "./node/item";
import { Button } from "./ui/button";

export default function AppCanvas() {
  const importFileRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [mediaType, setMediaType] = useState<Node["type"] | null>(null);
  const [nextId, setNextId] = useState(1);
  const [editingTextNode, setEditingTextNode] = useState<number | null>(null);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<number | null>(null);
  const [selectedNodeForMedia, setSelectedNodeForMedia] = useState<
    number | null
  >(null);
  const [tempLine, setTempLine] = useState<{ x: number; y: number } | null>(
    null,
  );

  // trigger file import selection
  function handleImportClick() {
    importFileRef.current?.click();
  }

  function createNode(type: Node["type"]) {
    const newNode: Node = {
      id: nextId,
      x: 100 + ((nextId * 30) % 500),
      y: 100 + ((nextId * 40) % 300),
      type,
      content: null,
      text: type === "text" ? "Click to edit" : null,
      width: 200,
      height: 200,
    };
    setNodes((prev) => [...prev, newNode]);
    setNextId((prev) => prev + 1);
    if (type === "text") setEditingTextNode(newNode.id);
  }

  function handleMouseDown(e: React.MouseEvent, node: Node) {
    // stop connection points from triggering drag
    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains("connection-point")
    ) {
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    });
    setDraggingNode(node.id);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (draggingNode !== null && canvasRef.current) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNode ? { ...n, x: newX, y: newY } : n,
        ),
      );
    }
    if (connectingFrom !== null && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setTempLine({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }

  function handleMouseUp() {
    setDraggingNode(null);
    setConnectingFrom(null);
    setTempLine(null);
  }

  function startConnection(e: React.MouseEvent, nodeId: number) {
    e.stopPropagation();
    setConnectingFrom(nodeId);
  }

  function endConnection(e: React.MouseEvent, nodeId: number) {
    e.stopPropagation();
    if (connectingFrom !== null && connectingFrom !== nodeId) {
      setConnections((prev) => [
        ...prev,
        {
          id: `${connectingFrom}-${nodeId}-${Date.now()}`,
          from: connectingFrom,
          to: nodeId,
        },
      ]);
    }
    setConnectingFrom(null);
    setTempLine(null);
  }

  function deleteNode(nodeId: number) {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) =>
      prev.filter((c) => c.from !== nodeId && c.to !== nodeId),
    );
  }

  function clearAll() {
    if (confirm("Clear all nodes and connections?")) {
      setNodes([]);
      setConnections([]);
      setNextId(1);
    }
  }

  function handleMediaUpload(nodeId: number, type: Node["type"]) {
    setSelectedNodeForMedia(nodeId);
    setMediaType(type);
    fileInputRef.current?.click();
  }

  function handleFileChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const file = evt.target.files?.[0];
    if (!file || selectedNodeForMedia === null) return;
    const reader = new FileReader();
    if (mediaType === "image") {
      // xonvert image to base64
      reader.onload = () => {
        const base64 = reader.result as string;
        setNodes((prev) =>
          prev.map((n) =>
            n.id === selectedNodeForMedia ? { ...n, content: base64 } : n,
          ),
        );
        setSelectedNodeForMedia(null);
        setMediaType(null);
      };
      reader.readAsDataURL(file);
    } else {
      // for audio/video, keep blob URL
      const objectUrl = URL.createObjectURL(file);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === selectedNodeForMedia ? { ...n, content: objectUrl } : n,
        ),
      );
      setSelectedNodeForMedia(null);
      setMediaType(null);
    }
  }

  function handleTextChange(nodeId: number, text: string) {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, text } : n)));
  }

  function getNodeCenter(node: Node) {
    return {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2,
    };
  }

  function getAcceptType() {
    if (mediaType === "image") return "image/*";
    if (mediaType === "audio") return "audio/*";
    if (mediaType === "video") return "video/*";
    return "*/*";
  }

  function renderNodeContent(node: Node) {
    if (node.type === "text") {
      return editingTextNode === node.id ? (
        <textarea
          autoFocus
          value={node.text || ""}
          onChange={(e) => handleTextChange(node.id, e.target.value)}
          onBlur={() => setEditingTextNode(null)}
          className="w-full h-full bg-transparent p-3 resize-none outline-none"
        />
      ) : (
        <div
          onDoubleClick={() => setEditingTextNode(node.id)}
          className="w-full h-full p-3 overflow-auto select-none"
        >
          {node.text || "Double-click to edit"}
        </div>
      );
    }

    if (node.type === "image" && node.content)
      return (
        <Image
          src={node.content}
          className="w-full h-full object-contain select-none"
          alt=""
          draggable={false}
          width={500}
          height={500}
        />
      );

    if (node.type === "audio" && node.content) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-3 select-none">
          <Music size={28} className="text-purple-400 mb-2" />
          <audio controls className="w-full">
            <source src={node.content} />
          </audio>
        </div>
      );
    }

    if (node.type === "video" && node.content) {
      return (
        <video
          controls
          className="w-full h-full object-cover select-none"
          draggable={false}
        >
          <source src={node.content} />
        </video>
      );
    }

    const Icon =
      node.type === "image"
        ? ImageIcon
        : node.type === "audio"
          ? Music
          : node.type === "video"
            ? Video
            : Type;

    return (
      <div className="flex flex-col items-center justify-center h-full text-center select-none">
        <Icon size={20} className="" />
      </div>
    );
  }

  function exportCanvas() {
    const exportData = {
      nodes,
      connections,
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindddy-${getCurrentDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = reader.result as string;
        const data: { nodes: Node[]; connections: NodeConnection[] } =
          JSON.parse(json);
        // strict validation: ensure arrays and proper structure
        if (!Array.isArray(data.nodes) || !Array.isArray(data.connections)) {
          throw new Error("Invalid JSON format");
        }
        for (const node of data.nodes) {
          if (
            typeof node.id !== "number" ||
            typeof node.x !== "number" ||
            typeof node.y !== "number" ||
            typeof node.type !== "string"
          ) {
            throw new Error("Invalid node format");
          }
        }
        for (const conn of data.connections) {
          if (
            typeof conn.id !== "string" ||
            typeof conn.from !== "number" ||
            typeof conn.to !== "number"
          ) {
            throw new Error("Invalid connection format");
          }
        }
        // load data
        setNodes(data.nodes);
        setConnections(data.connections);
        setNextId(Math.max(...data.nodes.map((n) => n.id), 0) + 1);
        setEditingTextNode(null);
      } catch (err) {
        console.error("Failed to import JSON:", err);
        alert("Invalid JSON file!");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input so you can re-import same file
  }

  return (
    <div className="w-full h-screen flex flex-col select-none">
      {/*---- toolbar ----*/}
      <div className="p-2 flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            exportCanvas();
            window.location.reload();
          }}
        >
          <PlusIcon /> New page
        </Button>
        <Button variant="outline" onClick={handleImportClick}>
          <Upload /> Import
        </Button>
        <Button variant="outline" onClick={exportCanvas}>
          <Download /> Export
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => createNode("text")}
        >
          <Type />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => createNode("image")}
        >
          <ImageIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => createNode("audio")}
        >
          <Music />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => createNode("video")}
        >
          <Video />
        </Button>
        <Button variant="outline" size="icon" onClick={clearAll}>
          <Trash2 />
        </Button>
      </div>

      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* ---- node connections ---*/}
        <NodeConnectionLine
          nodes={nodes}
          connections={connections}
          connectingFrom={connectingFrom}
          tempLine={tempLine}
          getNodeCenter={getNodeCenter}
        />

        {/* ---- nodes ---- */}
        {nodes.map((node, index) => (
          <NodeItem
            key={index}
            node={node}
            handleMouseDown={handleMouseDown}
            deleteNode={deleteNode}
            handleMediaUpload={handleMediaUpload}
            renderNodeContent={renderNodeContent}
            startConnection={startConnection}
            endConnection={endConnection}
          />
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptType()}
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        ref={importFileRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="hidden"
      />
    </div>
  );
}
