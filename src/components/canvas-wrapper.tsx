"use client";

import { Circle, Eraser, Pen, Redo, Undo, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Canvas, { CanvasHandle } from "./canvas";
import useFullscreenStore from "@/stores/fullscreen";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { HexColorPicker } from "react-colorful";

export default function CanvasWrapper() {
    const [eraseMode, setEraseMode] = useState(false);
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [eraserSize, setEraserSize] = useState(12);
    const [strokeColor, setStrokeColor] = useState("#000000");

    const canvasRef = useRef<CanvasHandle>(null);
    const inputColorRef = useRef<HTMLInputElement>(null);
    const inputFileRef = useRef<HTMLInputElement>(null);

    const { fullscreen, setFullscreen } = useFullscreenStore();

    // handle keyboard undo/redo
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (
                e.ctrlKey &&
                (e.key.toLowerCase() === "z" || e.key.toLowerCase() === "y")
            ) {
                e.preventDefault();
                if (
                    e.key.toLowerCase() === "y" ||
                    (e.shiftKey && e.key.toLowerCase() === "z")
                ) {
                    canvasRef.current?.redo();
                } else {
                    canvasRef.current?.undo();
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    function handleUndo() {
        canvasRef.current?.undo();
    }

    function handleRedo() {
        canvasRef.current?.redo();
    }

    function handleUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        canvasRef.current?.loadImage(file);
    }

    return (
        <div className="flex flex-col border shadow-xl w-fit rounded-2xl overflow-hidden">
            <div className="p-2 border-b flex gap-2 justify-between w-full">
                <div className="flex gap-2">
                    <ToggleGroup
                        variant="outline"
                        type="single"
                        size="default"
                        value={eraseMode ? "eraser" : "pen"}
                    >
                        <ToggleGroupItem
                            value="pen"
                            onClick={() => setEraseMode(false)}
                        >
                            <Pen />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="eraser"
                            onClick={() => setEraseMode(true)}
                        >
                            <Eraser />
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup
                        variant="outline"
                        type="single"
                        size="default"
                        value="none"
                    >
                        <ToggleGroupItem value="undo" onClick={handleUndo}>
                            <Undo />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="redo" onClick={handleRedo}>
                            <Redo />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => inputColorRef.current?.click()}
                        >
                            <Circle fill={strokeColor} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent asChild>
                        <HexColorPicker
                            color={strokeColor}
                            onChange={(e) => setStrokeColor(e)}
                        />
                    </PopoverContent>
                </Popover>
                <Button
                    variant="outline"
                    onClick={() => inputFileRef.current?.click()}
                >
                    <Upload />
                    upload
                    <input
                        className="hidden"
                        type="file"
                        accept="image/png"
                        ref={inputFileRef}
                        onChange={handleUpload}
                    />
                </Button>
            </div>
            <div className="p-4 border-b">
                <Slider
                    defaultValue={[strokeWidth]}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                        eraseMode
                            ? setEraserSize(value[0])
                            : setStrokeWidth(value[0])
                    }
                    value={[eraseMode ? eraserSize : strokeWidth]}
                />
            </div>
            <div className="relative">
                <Canvas
                    ref={canvasRef}
                    eraseMode={eraseMode}
                    strokeWidth={strokeWidth}
                    eraserSize={eraserSize}
                    strokeColor={strokeColor}
                />
                {/* <Button
                    variant="outline"
                    onClick={() => setFullscreen(!fullscreen)}
                    size={"icon"}
                    className="absolute bottom-2 right-2"
                >
                    <Maximize />
                </Button> */}
            </div>
        </div>
    );
}
