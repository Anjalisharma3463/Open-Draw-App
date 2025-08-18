 export function initDraw( canvas: HTMLCanvasElement) {
            const ctx = canvas.getContext("2d");
                   if(!ctx){
                console.error("Failed to get canvas context");
                return;
            }
           ctx.fillStyle = "rgba(0,0,0)";
           ctx.fillRect(0, 0, canvas.width, canvas.height);
          
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
                  

                   ctx.fillStyle = "rgba(0,0,0)";
                   ctx.fillRect(0, 0, canvas.width, canvas.height);
                   ctx.strokeStyle = "rgba(255,255,255)";
                   ctx.strokeRect(startx, starty, e.clientX - startx, e.clientY - starty);

               }
            });
 }