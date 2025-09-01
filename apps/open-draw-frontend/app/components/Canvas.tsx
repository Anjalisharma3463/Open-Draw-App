import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/draw/Game";
import {
  Mouse,
  Square,

  Minus,
  ArrowRight,
  Edit3,
  Type as TypeIcon,
  Hand,
  RotateCcw,
  RotateCw,
  Share2,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: Number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle")

    useEffect(() => {
        game?.setTool(selectedTool);
        console.log("Setting tool:", selectedTool)
    }, [selectedTool, game]);

    useEffect(() => {

        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);
       console.log("type of room id in  canvas in usereffect of canvasref : ", typeof(roomId));

            return () => {
                g.destroy();
            }
        }


    }, [canvasRef]);

    return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
}

function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div
    className=" absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
    style={{
            position: "fixed",
            top: 10,
            left: 360
        }}>
            <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg border border-gray-700">
                <IconButton
    className="p-2 rounded hover:bg-gray-700 transition-colors"
    onClick={() => setSelectedTool("pencil")}
    activated={selectedTool === "pencil"}
    icon={<Pencil />}
/>
<IconButton
    className="p-2 rounded hover:bg-gray-700 transition-colors"
    onClick={() => setSelectedTool("rect")}
    activated={selectedTool === "rect"}
    icon={<RectangleHorizontalIcon />}
/>
<IconButton
    className="p-2 rounded hover:bg-gray-700 transition-colors"
    onClick={() => setSelectedTool("circle")}
    activated={selectedTool === "circle"}
    icon={<Circle />}
/>
<IconButton
    className="p-2 rounded hover:bg-gray-700 transition-colors"
    onClick={() => setSelectedTool("circle")}
    activated={selectedTool === "circle"}
    icon={<Circle />}
/>
  <IconButton
    className="p-2 rounded hover:bg-gray-700 transition-colors"
    onClick={() => setSelectedTool("circle")}
    activated={selectedTool === "circle"}
    icon={<Circle />}
/>
<IconButton
    className="p-2 rounded hover:bg-gray-700 transition-colors"
    onClick={() => setSelectedTool("circle")}
    activated={selectedTool === "circle"}
    icon={<Circle />}
/>
            </div>
        </div>
}