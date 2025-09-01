"use client"

import type React from "react"
import { getExistingShapes } from "@/utils/http"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  Mouse,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Edit3,
  Type,
  Hand,
  RotateCcw,
  RotateCw,
  Share2,
  BookOpen,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type ToolId = "select" | "rectangle" | "circle" | "arrow" | "line" | "pencil" | "text" | "hand"
type ElementType = "rectangle" | "circle" | "arrow" | "line" | "pencil" | "text"
type StrokeStyle = "solid" | "dashed" | "dotted"
type Sloppiness = 0 | 1 | 2
type EdgeMode = "sharp" | "round"
type Point = { x: number; y: number }

type BaseElement = {
  id: number
  type: ElementType
  strokeColor: string
  backgroundColor?: string
  strokeWidth: number
  strokeStyle?: StrokeStyle
  sloppiness?: Sloppiness
  edges?: EdgeMode
  opacity: number
}

type ShapeElement = BaseElement & { x1: number; y1: number; x2: number; y2: number }
type PencilElement = BaseElement & { points: Point[] }
type TextElement = BaseElement & {
  x1: number
  y1: number
  text: string
  fontSize: "S" | "M" | "L" | "XL"
  fontFamily: "hand" | "normal" | "code"
  textAlign: "left" | "center" | "right"
}
type AnyElement = ShapeElement | PencilElement | TextElement

const colors = ["#ffffff", "#e03131", "#2f9e44", "#1971c2", "#f08c00", "#9ca3af"] as const

const tools: { id: ToolId; icon: any; label: string }[] = [
  { id: "select", icon: Mouse, label: "Select" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "arrow", icon: ArrowRight, label: "Arrow" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "pencil", icon: Edit3, label: "Draw" },
  { id: "text", icon: Type, label: "Text" },
  { id: "hand", icon: Hand, label: "Hand" },
]

const ExcalidrawClone = ({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: Number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [tool, setTool] = useState<ToolId>("select")
  const [isDrawing, setIsDrawing] = useState(false)
  const [elements, setElements] = useState<AnyElement[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // styles
  const [strokeColor, setStrokeColor] = useState("#ffffff")
  const [backgroundColor, setBgColor] = useState<string>("transparent")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid")
  const [sloppiness, setSloppiness] = useState<Sloppiness>(1)
  const [edges, setEdges] = useState<EdgeMode>("round")
  const [opacity, setOpacity] = useState(100)

  // text
  const [fontSize, setFontSize] = useState<TextElement["fontSize"]>("M")
  const [fontFamily, setFontFamily] = useState<TextElement["fontFamily"]>("hand")
  const [textAlign, setTextAlign] = useState<TextElement["textAlign"]>("left")

  // viewport
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(100)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [locked, setLocked] = useState(false)

  // interaction
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [currentPath, setCurrentPath] = useState<Point[]>([])

  // history
  const [undoStack, setUndoStack] = useState<AnyElement[][]>([])
  const [redoStack, setRedoStack] = useState<AnyElement[][]>([])
// If canvasOffset = {x:100, y:50}, then drawing at (0,0) will now appear at (100,50) on screen.
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - canvasOffset.x) / (zoom / 100),
      y: (e.clientY - rect.top - canvasOffset.y) / (zoom / 100),
    }
  }


useEffect(() => {
  async function loadShapes() {
    const initialShapes = await getExistingShapes(roomId);
    setElements(initialShapes); // use your existing setElements
  }
  loadShapes();
}, [roomId]);



useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    if (msg.type !== "chat" || msg.roomId !== roomId) return;

    const parsedShape = JSON.parse(msg.message).shape;
    setElements(prev => [...prev, parsedShape]); // merge into state
  };



  socket.addEventListener("message", handleMessage);
  return () => socket.removeEventListener("message", handleMessage);
}, [roomId, socket]);

  const pushHistory = (prev: AnyElement[]) => {
    setUndoStack((s) => [...s, prev])
    setRedoStack([])
  }
const broadcastShape = (shape: AnyElement) => {
  socket.send(JSON.stringify({
    type: "chat",
    message: JSON.stringify({ shape }),
    roomId
  }));
};

const setElementsWithHistory = (updater: (prev: AnyElement[]) => AnyElement[]) => {
  setElements(prev => {
    const next = updater(prev);
    pushHistory(prev);

    // Send only the newest shape if that's how you structure it
    const newShape = next[next.length - 1];
    broadcastShape(newShape);

    return next;
  });
};


  const handleUndo = () => {
    setUndoStack((prev) => {
      if (!prev.length) return prev
      const last = prev[prev.length - 1]
      setRedoStack((r) => [...r, elements])
      setElements(last)
      return prev.slice(0, -1)
    })
  }

  const handleRedo = () => {
    setRedoStack((prev) => {
      if (!prev.length) return prev
      const last = prev[prev.length - 1]
      setUndoStack((u) => [...u, elements])
      setElements(last)
      return prev.slice(0, -1)
    })
  }

  // sloppiness helpers (rough-like)
  const roughOffset = (mag: number) => (Math.random() - 0.5) * mag
  const drawRoughLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, s: number) => {
    ctx.beginPath()
    ctx.moveTo(x1 + roughOffset(0.6 * s), y1 + roughOffset(0.6 * s))
    ctx.lineTo(x2 + roughOffset(0.6 * s), y2 + roughOffset(0.6 * s))
    ctx.stroke()
    if (s > 0) {
      ctx.beginPath()
      ctx.moveTo(x1 + roughOffset(1.0 * s), y1 + roughOffset(1.0 * s))
      ctx.lineTo(x2 + roughOffset(1.0 * s), y2 + roughOffset(1.0 * s))
      ctx.stroke()
    }
  }
  const drawRoughRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, s: number) => {
    ctx.beginPath()
    ctx.rect(x + roughOffset(0.6 * s), y + roughOffset(0.6 * s), w + roughOffset(1.0 * s), h + roughOffset(1.0 * s))
    ctx.stroke()
    if (s > 0) {
      ctx.beginPath()
      ctx.rect(x + roughOffset(1.2 * s), y + roughOffset(1.2 * s), w + roughOffset(1.2 * s), h + roughOffset(1.2 * s))
      ctx.stroke()
    }
  }
  const drawRoughCircle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, s: number) => {
    ctx.beginPath()
    ctx.arc(cx + roughOffset(0.6 * s), cy + roughOffset(0.6 * s), r + roughOffset(0.8 * s), 0, Math.PI * 2)
    ctx.stroke()
    if (s > 0) {
      ctx.beginPath()
      ctx.arc(cx + roughOffset(1.2 * s), cy + roughOffset(1.2 * s), r + roughOffset(1.2 * s), 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const applyElementStrokeStyle = (ctx: CanvasRenderingContext2D, el: AnyElement) => {
    const style = el.strokeStyle || "solid"
    if (style === "solid") ctx.setLineDash([])
    if (style === "dashed") ctx.setLineDash([10, 8])
    if (style === "dotted") ctx.setLineDash([2, 6])
  }

  const applyCurrentStrokeStyle = (ctx: CanvasRenderingContext2D) => {
    if (strokeStyle === "solid") ctx.setLineDash([])
    if (strokeStyle === "dashed") ctx.setLineDash([10, 8])
    if (strokeStyle === "dotted") ctx.setLineDash([2, 6])
  }

  const drawElement = (ctx: CanvasRenderingContext2D, element: AnyElement) => {
    ctx.save()
    ctx.strokeStyle = element.strokeColor
    ctx.fillStyle = element.backgroundColor || "transparent"
    ctx.lineWidth = element.strokeWidth
    ctx.globalAlpha = element.opacity / 100
    ctx.lineCap = element.edges === "sharp" ? "butt" : "round"
    ctx.lineJoin = element.edges === "sharp" ? "miter" : "round"
    applyElementStrokeStyle(ctx, element)

    switch (element.type) {
      case "rectangle": {
        const el = element as ShapeElement & BaseElement
        const x = el.x1
        const y = el.y1
        const w = el.x2 - el.x1
        const h = el.y2 - el.y1
        if (el.backgroundColor && el.backgroundColor !== "transparent") {
          ctx.save()
          ctx.setLineDash([])
          ctx.fillStyle = el.backgroundColor
          ctx.globalAlpha = element.opacity / 100
          ctx.fillRect(x, y, w, h)
          ctx.restore()
        }
        const s = el.sloppiness || 0
        s ? drawRoughRect(ctx, x, y, w, h, s) : ctx.strokeRect(x, y, w, h)
        break
      }
      case "circle": {
        const el = element as ShapeElement & BaseElement
        const cx = (el.x1 + el.x2) / 2
        const cy = (el.y1 + el.y2) / 2
        const r = Math.sqrt((el.x2 - el.x1) ** 2 + (el.y2 - el.y1) ** 2) / 2
        if (el.backgroundColor && el.backgroundColor !== "transparent") {
          ctx.save()
          ctx.setLineDash([])
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        const s = el.sloppiness || 0
        if (s) {
          drawRoughCircle(ctx, cx, cy, r, s)
        } else {
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.stroke()
        }
        break
      }
      case "line": {
        const el = element as ShapeElement & BaseElement
        const s = el.sloppiness || 0
        s
          ? drawRoughLine(ctx, el.x1, el.y1, el.x2, el.y2, s)
          : (ctx.beginPath(), ctx.moveTo(el.x1, el.y1), ctx.lineTo(el.x2, el.y2), ctx.stroke())
        break
      }
      case "arrow": {
        const el = element as ShapeElement & BaseElement
        const s = el.sloppiness || 0
        s
          ? drawRoughLine(ctx, el.x1, el.y1, el.x2, el.y2, s)
          : (ctx.beginPath(), ctx.moveTo(el.x1, el.y1), ctx.lineTo(el.x2, el.y2), ctx.stroke())
        const angle = Math.atan2(el.y2 - el.y1, el.x2 - el.x1)
        const headlen = 14
        const drawHead = (off = 0) => {
          ctx.beginPath()
          ctx.moveTo(el.x2, el.y2)
          ctx.lineTo(
            el.x2 - headlen * Math.cos(angle - Math.PI / 6) + off,
            el.y2 - headlen * Math.sin(angle - Math.PI / 6) + off,
          )
          ctx.moveTo(el.x2, el.y2)
          ctx.lineTo(
            el.x2 - headlen * Math.cos(angle + Math.PI / 6) + off,
            el.y2 - headlen * Math.sin(angle + Math.PI / 6) + off,
          )
          ctx.stroke()
        }
        drawHead(0)
        if (s) drawHead(roughOffset(0.6 * s))
        break
      }
      case "pencil": {
        const el = element as PencilElement & BaseElement
        if (el?.points?.length > 1) {
          ctx.beginPath()
          ctx.moveTo(el.points[0].x, el.points[0].y)
          for (let i = 1; i < el.points.length; i++) ctx.lineTo(el.points[i].x, el.points[i].y)
          ctx.stroke()
        }
        break
      }
      case "text": {
        const el = element as TextElement & BaseElement
        const fontSizeMap = { S: 16, M: 20, L: 28, XL: 36 } as const
        const family =
          el.fontFamily === "hand"
            ? "cursive"
            : el.fontFamily === "code"
              ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              : "system-ui, -apple-system, Segoe UI, Roboto, Arial"
        ctx.font = `${fontSizeMap[el.fontSize]}px ${family}`
        ctx.fillStyle = el.strokeColor
        ctx.textAlign = el.textAlign
        ctx.fillText(el.text || "Text", el.x1, el.y1)
        break
      }
    }

    ctx.restore()
  }

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvasOffset.x, canvasOffset.y)
    ctx.scale(zoom / 100, zoom / 100)

    if (showGrid) {
      ctx.strokeStyle = "#2f2f2f"
      ctx.lineWidth = 0.5
      ctx.setLineDash([])
      const gridSize = 20
      for (let x = -canvasOffset.x; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, -canvasOffset.y)
        ctx.lineTo(x, canvas.height - canvasOffset.y)
        ctx.stroke()
      }
      for (let y = -canvasOffset.y; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(-canvasOffset.x, y)
        ctx.lineTo(canvas.width - canvasOffset.x, y)
        ctx.stroke()
      }
    }

    elements.forEach((el) => drawElement(ctx, el))
    ctx.restore()
  }, [elements, canvasOffset, zoom, showGrid])

  useEffect(() => {
    const canvas = canvasRef.current!
    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      redrawCanvas()
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [redrawCanvas])

  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  const hitTest = (p: Point) =>
    elements
      .slice()
      .reverse()
      .find((el) => {
        if (el.type === "pencil") {
          const pe = el as PencilElement
          return pe.points.some((pt) => Math.hypot(pt.x - p.x, pt.y - p.y) < 6)
        }
        if (el.type === "text") {
          const t = el as TextElement
          return Math.abs(t.x1 - p.x) < 60 && Math.abs(t.y1 - p.y) < 24
        }
        const se = el as ShapeElement
        const minx = Math.min(se.x1, se.x2)
        const maxx = Math.max(se.x1, se.x2)
        const miny = Math.min(se.y1, se.y2)
        const maxy = Math.max(se.y1, se.y2)
        return p.x >= minx && p.x <= maxx && p.y >= miny && p.y <= maxy
      })

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (locked) return
    const pos = getMousePos(e)

    if (tool === "hand") {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      return
    }
    if (tool === "select") {
      const hit = hitTest(pos)
      setSelectedId(hit?.id ?? null)
      return
    }
    if (tool === "text") {
      const text = window.prompt("Enter text:")
      if (text) {
        setElementsWithHistory((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "text",
            x1: pos.x,
            y1: pos.y,
            text,
            strokeColor,
            fontSize,
            fontFamily,
            textAlign,
            opacity,
            strokeWidth,
            strokeStyle,
            sloppiness,
            edges,
          } as TextElement,
        ])
      }
      return
    }

    setIsDrawing(true)
    setStartPoint(pos)
    if (tool === "pencil") setCurrentPath([pos])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const pos = getMousePos(e)

    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setCanvasOffset((p) => ({ x: p.x + dx, y: p.y + dy }))
      setDragStart({ x: e.clientX, y: e.clientY })
      return
    }

    if (!isDrawing) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    redrawCanvas()

    ctx.save()
    ctx.translate(canvasOffset.x, canvasOffset.y)
    ctx.scale(zoom / 100, zoom / 100)
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.globalAlpha = opacity / 100
    ctx.lineCap = edges === "sharp" ? "butt" : "round"
    ctx.lineJoin = edges === "sharp" ? "miter" : "round"
    applyCurrentStrokeStyle(ctx)

    if (tool === "pencil") {
      setCurrentPath((prev) => [...prev, pos])
      if (currentPath.length > 1) {
        ctx.beginPath()
        ctx.moveTo(currentPath[0].x, currentPath[0].y)
        for (let i = 1; i < currentPath.length; i++) ctx.lineTo(currentPath[i].x, currentPath[i].y)
        ctx.stroke()
      }
    } else {
      const preview: AnyElement = { 
        id: -1,
        type: tool as ElementType,
        x1: startPoint.x,
        y1: startPoint.y,
        x2: pos.x,
        y2: pos.y,
        strokeColor,
        backgroundColor,
        strokeWidth,
        strokeStyle,
        sloppiness,
        edges,
        opacity,
      }
      drawElement(ctx, preview)
    }
    ctx.restore()
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (isDragging) {
      setIsDragging(false)
      return
    }
    if (!isDrawing) return
    const pos = getMousePos(e)

    if (tool === "pencil") {
      if (currentPath.length > 1) {
        setElementsWithHistory((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "pencil",
            points: currentPath,
            strokeColor,
            strokeWidth,
            strokeStyle,
            sloppiness,
            edges,
            opacity,
          } as PencilElement,
        ])
      }
      setCurrentPath([])
    } else {
      const newEl: AnyElement = { 
        id: Date.now(),
        type: tool as ElementType,
        x1: startPoint.x,
        y1: startPoint.y,
        x2: pos.x,
        y2: pos.y,
        strokeColor,
        backgroundColor,
        strokeWidth,
        strokeStyle,
        sloppiness,
        edges,
        opacity,
      }
      setElementsWithHistory((prev) => [...prev, newEl])
    }
    setIsDrawing(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -10 : 10
    setZoom((prev) => Math.max(10, Math.min(300, prev + delta)))
  }

  // layers
  const bringForward = () => {
    if (selectedId == null) return
    setElementsWithHistory((prev) => {
      const idx = prev.findIndex((e) => e.id === selectedId)
      if (idx === -1 || idx === prev.length - 1) return prev
      const copy = prev.slice()
      const [el] = copy.splice(idx, 1)
      copy.splice(idx + 1, 0, el)
      return copy
    })
  }
  const sendBackward = () => {
    if (selectedId == null) return
    setElementsWithHistory((prev) => {
      const idx = prev.findIndex((e) => e.id === selectedId)
      if (idx <= 0) return prev
      const copy = prev.slice()
      const [el] = copy.splice(idx, 1)
      copy.splice(idx - 1, 0, el)
      return copy
    })
  }
  const toFront = () => {
    if (selectedId == null) return
    setElementsWithHistory((prev) => {
      const idx = prev.findIndex((e) => e.id === selectedId)
      if (idx === -1) return prev
      const copy = prev.slice()
      const [el] = copy.splice(idx, 1)
      copy.push(el)
      return copy
    })
  }
  const toBack = () => {
    if (selectedId == null) return
    setElementsWithHistory((prev) => {
      const idx = prev.findIndex((e) => e.id === selectedId)
      if (idx === -1) return prev
      const copy = prev.slice()
      const [el] = copy.splice(idx, 1)
      copy.unshift(el)
      return copy
    })
  }

  const clearCanvas = () => {
    pushHistory(elements)
    setElements([])
    setSelectedId(null)
  }

  const countByType = (t: ElementType) => elements.filter((e) => e.type === t).length
  const changeZoom = (d: number) => setZoom((z) => Math.max(10, Math.min(300, z + d)))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.shiftKey ? handleRedo() : handleUndo()
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId != null) {
        setElementsWithHistory((prev) => prev.filter((el) => el.id !== selectedId))
        setSelectedId(null)
      }
      if (e.code === "Space") setTool("hand")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedId, elements])

  return (
    <div className="w-full h-screen bg-[#1f1f22] text-white relative overflow-hidden">
      {/* Top toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-[#2a2a2e] rounded-xl px-2 py-1.5 flex items-center gap-1 shadow border border-[#3a3a3f]">
          <button
            onClick={() => setLocked((v) => !v)}
            className="p-2 rounded-lg hover:bg-[#35353a]"
            title={locked ? "Unlock canvas" : "Lock canvas"}
          >
            {locked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>

          {tools.map((t) => {
            const active = tool === t.id
            const badge = (["rectangle", "circle", "arrow", "line", "pencil", "text"] as ElementType[]).includes(
              t.id as ElementType,
            )
              ? countByType(t.id as ElementType)
              : 0
            return (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`relative p-2 rounded-lg ${active ? "bg-[#6e56cf]" : "hover:bg-[#35353a]"}`}
                title={t.label}
              >
                <t.icon size={16} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-[#3a3a3f] px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}

          <div className="w-px h-6 bg-[#3a3a3f] mx-1" />

          <button className="p-2 rounded-lg hover:bg-[#35353a]" title="Library">
            <BookOpen size={16} />
          </button>
          <button
            className={`p-2 rounded-lg hover:bg-[#35353a] ${showGrid ? "text-[#6e56cf]" : ""}`}
            onClick={() => setShowGrid((v) => !v)}
            title="Toggle grid"
          >
            #
          </button>
        </div>
      </div>

      {/* Right controls */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2">
          <button
            className="bg-[#6e56cf] hover:bg-[#5a46b0] text-white text-sm px-3 py-1.5 rounded-lg shadow"
            title="Share"
          >
            <div className="flex items-center gap-1.5">
              <Share2 size={14} />
              <span>Share</span>
            </div>
          </button>
          <button
            className="bg-[#2a2a2e] hover:bg-[#35353a] px-3 py-1.5 rounded-lg border border-[#3a3a3f] text-sm"
            title="Library"
          >
            Library
          </button>
        </div>
      </div>

      {/* Left properties panel */}
      <div className="absolute left-4 top-5 z-20 space-y-4">
        {/* Stroke */}
        <div className="bg-[#2a2a2e] rounded-xl p-3 border border-[#3a3a3f]">
          <div className="text-xs mb-2">Stroke</div>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((c) => (
              <button
                key={`stroke-${c}`}
                onClick={() => setStrokeColor(c)}
                className={`w-7 h-7 rounded-lg border-2 ${strokeColor === c ? "border-[#6e56cf]" : "border-[#4b4b51]"}`}
                style={{ backgroundColor: c }}
                aria-label={`stroke ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Background */}
        <div className="bg-[#2a2a2e] rounded-xl p-3 border border-[#3a3a3f]">
          <div className="text-xs mb-2">Background</div>
          <div className="grid grid-cols-6 gap-2">
            {["transparent", ...colors].map((c) => (
              <button
                key={`bg-${c}`}
                onClick={() => setBgColor(c as string)}
                className={`w-7 h-7 rounded-lg border-2 ${
                  backgroundColor === c ? "border-[#6e56cf]" : "border-[#4b4b51]"
                } ${c === "transparent" ? "bg-[linear-gradient(45deg,#444_25%,transparent_25%),linear-gradient(-45deg,#444_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#444_75%),linear-gradient(-45deg,transparent_75%,#444_75%)] bg-[length:10px_10px] bg-[0_0,0_5px,5px_-5px,-5px_0]" : ""}`}
                style={{ backgroundColor: c === "transparent" ? undefined : (c as string) }}
                aria-label={`background ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Stroke width */}
        <div className="bg-[#2a2a2e] rounded-xl p-3 border border-[#3a3a3f]">
          <div className="text-xs mb-2">Stroke width</div>
          <div className="flex gap-2">
            {[1, 2, 4].map((w) => (
              <button
                key={`w-${w}`}
                onClick={() => setStrokeWidth(w)}
                className={`px-3 py-2 rounded-lg border ${
                  strokeWidth === w ? "border-[#6e56cf] bg-[#35353a]" : "border-[#3a3a3f] hover:bg-[#35353a]"
                }`}
              >
                <div className="w-6" style={{ borderBottom: `${w}px solid white` }} />
              </button>
            ))}
          </div>
        </div>

        {/* Stroke style */}
        <div className="bg-[#2a2a2e] rounded-xl p-3 border border-[#3a3a3f]">
          <div className="text-xs mb-2">Stroke style</div>
          <div className="flex gap-2">
            {(["solid", "dashed", "dotted"] as StrokeStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setStrokeStyle(s)}
                className={`px-3 py-2 rounded-lg border ${
                  strokeStyle === s ? "border-[#6e56cf] bg-[#35353a]" : "border-[#3a3a3f] hover:bg-[#35353a]"
                }`}
              >
                <div className="w-8" style={{ borderBottom: `2px ${s} white` }} />
              </button>
            ))}
          </div>
        </div>

        {/* Sloppiness */}
        <div className="bg-[#2a2a2e] rounded-xl p-3 border border-[#3a3a3f]">
          <div className="text-xs mb-2">Sloppiness</div>
          <div className="flex gap-2">
            {([0, 1, 2] as Sloppiness[]).map((s) => (
              <button
                key={`slop-${s}`}
                onClick={() => setSloppiness(s)}
                className={`px-3 py-2 rounded-lg border ${
                  sloppiness === s ? "border-[#6e56cf] bg-[#35353a]" : "border-[#3a3a3f] hover:bg-[#35353a]"
                }`}
              >
                {s === 0 ? "—" : s === 1 ? "≈" : "≋"}
              </button>
            ))}
          </div>
        </div>

        {/* Edges */}
        <div className="bg-[#2a2a2e] rounded-xl p-3 border border-[#3a3a3f]">
          <div className="text-xs mb-2">Edges</div>
          <div className="flex gap-2">
            {(["sharp", "round"] as EdgeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setEdges(m)}
                className={`px-3 py-2 rounded-lg border ${
                  edges === m ? "border-[#6e56cf] bg-[#35353a]" : "border-[#3a3a3f] hover:bg-[#35353a]"
                }`}
              >
                {m === "sharp" ? "□" : "◯"}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div className="bg-[#2a2a2e] rounded-xl p-3 border border-[#3a3a3f]">
          <div className="text-xs mb-2">Opacity</div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-6">0</span>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number.parseInt(e.target.value))}
              className="flex-1 h-1 bg-[#3a3a3f] rounded-lg"
            />
            <span className="text-xs w-8">{opacity}</span>
          </div>
        </div>

        {/* Layers */}
        <div className="bg-[#2a2a2e] rounded-xl p-3 border border-[#3a3a3f]">
          <div className="text-xs mb-2">Layers</div>
          <div className="flex gap-1">
            <button onClick={toBack} className="p-2 rounded-lg hover:bg-[#35353a]" title="Send to back">
              <ChevronDown size={14} />
            </button>
            <button onClick={sendBackward} className="p-2 rounded-lg hover:bg-[#35353a]" title="Send backward">
              <ChevronDown size={14} className="rotate-90" />
            </button>
            <button onClick={bringForward} className="p-2 rounded-lg hover:bg-[#35353a]" title="Bring forward">
              <ChevronUp size={14} className="-rotate-90" />
            </button>
            <button onClick={toFront} className="p-2 rounded-lg hover:bg-[#35353a]" title="Bring to front">
              <ChevronUp size={14} />
            </button>
            <button onClick={handleUndo} className="p-2 rounded-lg hover:bg-[#35353a]" title="Undo">
              <RotateCcw size={14} />
            </button>
            <button onClick={handleRedo} className="p-2 rounded-lg hover:bg-[#35353a]" title="Redo">
              <RotateCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom status/zoom */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-[#2a2a2e] rounded-xl px-2 py-1.5 border border-[#3a3a3f] flex items-center gap-2 text-sm">
          <button onClick={() => changeZoom(-10)} className="px-2 py-1 rounded-lg hover:bg-[#35353a]">
            −
          </button>
          <div className="min-w-14 text-center">{zoom}%</div>
          <button onClick={() => changeZoom(10)} className="px-2 py-1 rounded-lg hover:bg-[#35353a]">
            +
          </button>
          <div className="w-px h-5 bg-[#3a3a3f]" />
          <button onClick={handleUndo} className="px-2 py-1 rounded-lg hover:bg-[#35353a]">
            ↶
          </button>
          <button onClick={handleRedo} className="px-2 py-1 rounded-lg hover:bg-[#35353a]">
            ↷
          </button>
          <div className="w-px h-5 bg-[#3a3a3f]" />
          <button onClick={() => setZoom(100)} className="px-2 py-1 rounded-lg hover:bg-[#35353a]">
            Reset
          </button>
          <button onClick={clearCanvas} className="px-2 py-1 rounded-lg hover:bg-[#5a1f1f]">
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="cursor-crosshair"
        style={{
          cursor: tool === "hand" ? (isDragging ? "grabbing" : "grab") : tool === "select" ? "default" : "crosshair",
        }}
      />
    </div>
  )
}

export default ExcalidrawClone
