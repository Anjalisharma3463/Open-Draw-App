
"use client";
import { useEffect, useRef } from "react"

export default function Canvas(){
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(()=>{
          if(canvasRef.current){
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d"); 
            if(!ctx){
                console.error("Failed to get canvas context");
                return;
            }
            let startx = 0;
            let starty = 0;

            let clicked = false;

           canvas.addEventListener('mousedown', (e)=>{
               startx = e.clientX;
               starty = e.clientY;
               clicked = true;
                  console.log(e.clientX);
               console.log(e.clientY);
           })

           canvas.addEventListener('mouseup', (e)=>{
               clicked = false;
               console.log("mouse up",e.clientX);
               console.log("mouse up",e.clientY);

           })

           canvas.addEventListener('mousemove', (e)=>{
               if(clicked){
                   ctx.clearRect(0, 0, canvas.width, canvas.height);
                   ctx.strokeRect(startx, starty, e.clientX - startx, e.clientY - starty);
                    console.log("moving x: ",e.clientX);
               console.log("moving y: ",e.clientY);
                }
                 
           })

       }
    }, [canvasRef])

    return <div  >
        <canvas ref={canvasRef} width={500} height={500}></canvas>
    </div>
}