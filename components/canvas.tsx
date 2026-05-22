"use client";

import {
  useEffect
} from "react";

import { socket } from "@/lib/socket";

import {
  useCanvas
} from "@/hooks/useCanvas";

interface Props {
  roomId:string;
}

export default function Canvas({
 roomId
}:Props){

 const {
  canvasRef,
  isDrawing,
  setIsDrawing,
  prevPoint,
  setPrevPoint
 } = useCanvas();

 const drawLine = (
  start:{
   x:number;
   y:number;
  },
  end:{
   x:number;
   y:number;
  }
 )=>{

  const canvas =
   canvasRef.current;

  if(!canvas) return;

  const ctx =
   canvas.getContext("2d");

  if(!ctx) return;

  ctx.beginPath();

  ctx.moveTo(
   start.x,
   start.y
  );

  ctx.lineTo(
   end.x,
   end.y
  );

  ctx.stroke();
 };

 const getPoint = (
  e:React.MouseEvent
 )=>{

  const rect =
   canvasRef.current!
   .getBoundingClientRect();

  return {
   x:e.clientX - rect.left,
   y:e.clientY - rect.top
  };
 };

 const handleMouseDown = (
  e:React.MouseEvent
 )=>{

  setIsDrawing(true);

  setPrevPoint(
   getPoint(e)
  );
 };

 const handleMouseMove = (
  e:React.MouseEvent
 )=>{

  if(
   !isDrawing ||
   !prevPoint
  ) return;

  const current =
   getPoint(e);

  drawLine(
   prevPoint,
   current
  );

  socket.emit(
   "draw_move",
   {
    roomId,
    prevPoint,
    currentPoint:
      current
   }
  );

  setPrevPoint(
   current
  );
 };

 const handleMouseUp = ()=>{

  setIsDrawing(false);

  setPrevPoint(null);
 };

 useEffect(()=>{

  socket.on(
   "draw_data",
   ({
     prevPoint,
     currentPoint
   })=>{

     drawLine(
      prevPoint,
      currentPoint
     );
   }
  );

  return ()=>{

   socket.off(
    "draw_data"
   );
  };

 },[]);

 return (

  <canvas
   ref={canvasRef}
   width={900}
   height={600}
   className="
    border
    bg-white
   "
   onMouseDown={
    handleMouseDown
   }
   onMouseMove={
    handleMouseMove
   }
   onMouseUp={
    handleMouseUp
   }
   onMouseLeave={
    handleMouseUp
   }
  />

 );

}