import {
  useRef,
  useState
} from "react";

export function useCanvas() {

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const [isDrawing,setIsDrawing] =
    useState(false);

  const [prevPoint,setPrevPoint] =
    useState<{
      x:number;
      y:number;
    } | null>(null);

  return {
    canvasRef,
    isDrawing,
    setIsDrawing,
    prevPoint,
    setPrevPoint
  };
}