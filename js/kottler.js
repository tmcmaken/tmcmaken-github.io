
(function () {

    // Get the canvas element
    const canvas = document.getElementById('canvasKot');
    const ctx = canvas.getContext('2d');
    const LambdaSlider = document.getElementById('LambdaSlider');

    // Initial position and skew of the grid
    const w = canvas.width * 3 / 4;
    const h = canvas.height;
    const initialOffsetX = w / 2;
    const initialOffsetY = h / 2;
    const initialOffsetT = 0;

    // Store the current position and skew of the grid
    let offsetX = initialOffsetX;
    let offsetY = initialOffsetY;
    let offsetT = initialOffsetT;

    // Store the mouse coordinates
    let startX;
    let startY;
    let isDragging = false;

    // Define spacetime constants
    function sLambdafn(x) {
      return (27 - (26 / (1 + Math.pow(Math.E, -100 * (x + 0.05))))) * Math.asin(x) * 2 / (9.475 * Math.PI);
    }

    let Lambda = sLambdafn(parseFloat(LambdaSlider.value));
    let rH;
    let rC;
    let rU;
    let kappa;
    let kappaH;
    let kappaC;
    let kappaU;
    let q;

    // Functions to transform into Penrose coordinates
    function rtort(r) {
      if (Lambda > 0) {
        return (Math.log(Math.abs(1-(r/rH)))/(2*kappaH)) - (Math.log(Math.abs(1-(r/rC)))/(2*kappaC)) + (Math.log(Math.abs(1-(r/rU)))/(2*kappaU));
      } else if (Lambda == 0) {
        return r + 2 * Math.log(Math.abs((r / 2) - 1));
        } else {
        return (((6 * Math.pow(rH,2) - 12/Lambda) / q) * Math.atan((rH + 2*r) / q) + rH * Math.log(Math.pow(r - rH, 2) / (Math.pow(r, 2)+ (rH * r) + Math.pow(rH, 2) - 3/Lambda))) / (2 - 2 * Lambda * Math.pow(rH, 2));
      }
    }

    function pR(r,t) {
      const rs = rtort(r) - rtort(0);
      const rK = (Math.pow(Math.E, (rs + t)*kappaH) + Math.sign((r - rH)*(rC-r)) * Math.pow(Math.E, (rs - t)*kappaH)) / 2;
      const tK = (Math.pow(Math.E, (rs + t)*kappaH) - Math.sign((r - rH)*(rC-r)) * Math.pow(Math.E, (rs - t)*kappaH)) / 2;
      const R = Math.sign(r - rH) * (2*w / 3) * (Math.atan(rK+tK) + Math.atan(rK-tK)) / Math.PI + w / 6 - Math.sign(rC - r) * w / 3;
      return R;
    }
    function pT(r,t) {
      const rs = rtort(r) - rtort(0);
      const rK = (Math.pow(Math.E, (rs + t)*kappaH) + Math.sign((r - rH)*(rC-r)) * Math.pow(Math.E, (rs - t)*kappaH)) / 2;
      const tK = (Math.pow(Math.E, (rs + t)*kappaH) - Math.sign((r - rH)*(rC-r)) * Math.pow(Math.E, (rs - t)*kappaH)) / 2;
      const T = Math.sign(r - rH) * (2*h / 3) * (Math.atan(rK+tK) - Math.atan(rK-tK)) / Math.PI - h / 3 + Math.sign(rC - r) * h / 3; 
      return T;
    }

    // Function to draw the coordinate system with the grid
    function drawGrid() {
      if (Lambda > 0) {
        rH = (2/Math.sqrt(Lambda)) * Math.cos((Math.PI + Math.acos(3*Math.sqrt(Lambda)))/3);
        rC = (2/Math.sqrt(Lambda)) * Math.cos((Math.PI - Math.acos(3*Math.sqrt(Lambda)))/3);
        rU = -(rH+rC);
        kappaH = Lambda * (2*rH + rC) * (rC - rH) / (6*rH);
        kappaC = Lambda * (2*rC + rH) * (rC - rH) / (6*rC);
        kappaU = kappaH * kappaC / (kappaH - kappaC);
      } else if (Lambda == 0) {
        rH = 2;
        rC = 9999;
        kappaH = 1 / 4;
      } else {
        rH = (-Lambda - Math.pow(Math.cbrt(3*Math.pow(Lambda, 2) + Math.sqrt(Math.pow(Lambda, 3) * (-1 + 9*Lambda))), 2)) / (Lambda * Math.cbrt(3 * Math.pow(Lambda, 2) + Math.sqrt(Math.pow(Lambda, 3) * (-1 + 9*Lambda))));
        rC = 9999;
        q = Math.sqrt(3*Math.pow(rH, 2) - 12/Lambda);
        kappaH = Math.pow(rH, -2) - rH * Lambda / 3;
      }
      kappa = Math.max(kappaH, 0.05);

      ctx.clearRect(0, 0, 4*w/3, h);

      // Set the stroke color to white
      ctx.strokeStyle = 'white';

      // Save the canvas state
      ctx.save();

      // Translate the entire grid
      ctx.translate(w / 2, h / 2);
      
      // Draw the constant-t grid lines
      for (let t = offsetT; t <= 20/(4*kappa); ) {
        ctx.beginPath();
        ctx.moveTo(pR(0, t), pT(0, t));
        for (let r = 0; r <= rH; r += 0.01) {
          let x = r;
          let y = t;
          ctx.lineTo(pR(x, y), pT(x, y));
        }
        ctx.lineTo(pR(rH, t), pT(rH, t));
        for (let r = rH; r <= 100; r += 0.1) {
          let x = r;
          let y = t;
          ctx.lineTo(pR(x, y), pT(x, y));
        }
        if (Lambda > 0) {
          ctx.lineTo(pR(Math.pow(10,6),t), pT(Math.pow(10,6),t));
        }
        ctx.stroke();
        t += 1 / (4*kappa);
      }
      for (let t = offsetT; t >= -100/(4*kappa); ) {
        ctx.beginPath();
        ctx.moveTo(pR(0, t), pT(0, t));
        for (let r = 0; r <= rH; r += 0.01) {
          let x = r;
          let y = t;
          ctx.lineTo(pR(x, y), pT(x, y));
        }
        ctx.lineTo(pR(rH, t), pT(rH, t));
        for (let r = rH; r <= 100; r += 0.1) {
          let x = r;
          let y = t;
          ctx.lineTo(pR(x, y), pT(x, y));
        }
        if (Lambda > 0) {
          ctx.lineTo(pR(Math.pow(10,6),t), pT(Math.pow(10,6),t));
        }
        ctx.stroke();
        t = t - 1 / (4*kappa);
      }

      // Draw the constant-r grid lines
      for (let r = 0.08; r <= Math.min(20, rC); ) {
        ctx.beginPath();
        ctx.moveTo(pR(r, -100/(4*kappa)), pT(r, -100/(4*kappa)));
        for (let t = -100/(4*kappa)+offsetT; t <= 20/(4*kappa); t += 0.1 / (4*kappa)) {
          let x = r;
          let y = t;
          ctx.lineTo(pR(x, y), pT(x, y));
        }
        ctx.stroke();
        if (Lambda < 0) {
          r += (4 + 2*kappa) / 14;
        } else {
          r += 1 / (16*kappa);
        }
      }
      if (Lambda > 0) {
        for (let r = rC; r <= Math.pow(10,5);) {
          ctx.beginPath();
          ctx.moveTo(pR(r, -100/(4*kappa)), pT(r, -100/(4*kappa)));
          for (let t = -100/(4*kappa)+offsetT; t <= 20/(4*kappa); t += 0.1 / (4*kappa)) {
            let x = r;
            let y = t;
            ctx.lineTo(pR(x, y), pT(x, y));
          }
          ctx.stroke();
          if (r > 2*rC) {
            r = r * (2*rC + 1/(8*(0.25-kappa))*1/(16*kappa)) / (2*rC);
          } else {
            r = r + 1 / (8 * (0.25-kappa)) * 1 / (16*kappa);
          }
        }
      }

  ctx.strokeStyle = 'white';

// Draw the r=inf axis
  let xinf;
  if (Lambda < 0) {
    xinf = 40;
    ctx.lineWidth = 6;
  } else {
    xinf = Math.pow(10,5);
    ctx.lineWidth = 2;
  }
  ctx.beginPath();
  ctx.moveTo(pR(xinf, -10), pT(xinf, -10));
  for (let t = -100 + offsetT; t <= 20; t += 0.1) {
    ctx.lineTo(pR(xinf, t), pT(xinf, t));
  }
  ctx.stroke();

  ctx.lineWidth = 2;

  // Draw the t=0 axis
  ctx.beginPath();
  ctx.moveTo(pR(0, offsetT), pT(0, offsetT));
  for (let r = 0; r <= rH; r += 0.01 ) {
     let x = r;
     let y = offsetT;
     ctx.lineTo(pR(x, y), pT(x, y));
  }
  ctx.lineTo(pR(rH, offsetT), pT(rH, offsetT));
  for (let r = rH; r <= 100; r += 0.1 ) {
     let x = r;
     let y = offsetT;
     ctx.lineTo(pR(x, y), pT(x, y));
  }
  if (Lambda > 0) {
     ctx.lineTo(pR(Math.pow(10,6),offsetT), pT(Math.pow(10,6),offsetT));
  }
  ctx.stroke();

  // Draw the r=0 axis
  ctx.beginPath();
  ctx.moveTo(pR(0, -100), pT(0, -100));
  for (let t = -100; t <= 100; t += 1 ) {
     let x = 0;
     let y = t + offsetT;
     ctx.lineTo(pR(x, y), pT(x, y));
  }
  ctx.stroke();

      // Restore the canvas state
      ctx.restore();

  // Add text to label axes
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 18px Cambria';
  ctx.fillText('r = 0', 0.24 * w, 0.12 * h);
  ctx.fillText('t\u2192\u221E', 0.68 * w, 0.12 * h);
  ctx.fillText('t\u2192\u2013\u221E', 0.67 * w, 0.88 * h);
  ctx.fillText('r = r', 0.28 * w, 0.53 * h);
  if (Lambda <= 0) {
    ctx.fillText('r\u2192\u221E', pR(100,0) + 0.57*w, 0.53 * h);
  } else {
    ctx.fillText('r\u2192\u221E', w, pT(Math.pow(10,6),0)+0.45*h);
    ctx.fillText('r = r',  pR(100,0) + 0.57*w, 0.53 * h);
    ctx.font = 'italic 12px Cambria';
    ctx.fillText('C', pR(100,0) + 0.62*w, 0.545 * h);
  }
  ctx.font = 'italic 12px Cambria';
  ctx.fillText('E', 0.33 * w, 0.545 * h);

      // Add text for Lambda
      ctx.font = 'italic 16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('\u039B = ' + Lambda.toFixed(2) + " c\u2074/(GM)\u00B2", 0.25*w, 0.95*h);


      // Draw the fixed axes
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(pR(rH,0) + w/2, pT(rH,0)+ h/2);
      ctx.lineTo(pR(rC-.001,0) + w/2, pT(rC-.001,0) + h/2);
      if (Lambda > 0) {
        ctx.lineTo(pR(Math.pow(10,6),0) + w/2, pT(Math.pow(10,6),0) + h/2);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pR(0,0) + w/2, pT(0,0) + h/2);
      ctx.lineTo(pR(rH,0) + w/2, pT(rH,0) + h/2);
      ctx.stroke();
    }

    // Function to handle mouse down event
    function handleMouseDown(e) {
      startX = e.pageX - canvas.offsetLeft;
      startY = e.pageY - canvas.offsetTop;
      isDragging = true;
    }

    // Function to handle mouse move event
    function handleMouseMove(e) {
      const mouseX = e.pageX - canvas.offsetLeft;
      const mouseY = e.pageY - canvas.offsetTop;

      if (isDragging) {
        // Update the offset position
        offsetX += mouseX - startX;
        offsetY += mouseY - startY;
        if ((startX+startY>320) && (startX-startY<180)) {
           offsetT += (mouseY - startY) / (88*kappa);
        } else {
           offsetT += Math.sign(startX - 2*w/3) * (mouseX - startX) / (88*kappa);
        }
      }

      // Redraw the coordinate grid with the updated translation
      drawGrid();

      // Update the start position for the next move
      startX = mouseX;
      startY = mouseY;
    }

    // Function to handle mouse up event
    function handleMouseUp(e) {
      isDragging = false;
    }

    // Function to update Lambda and redraw the grid
    function updateLambda() {
      Lambda = sLambdafn(parseFloat(LambdaSlider.value));
      drawGrid();
    }

    // Add event listener to Lambda slider
    LambdaSlider.addEventListener('input', updateLambda);

    // Function to handle reset button click event
    function handleResetButtonClick() {
      offsetX = initialOffsetX;
      offsetY = initialOffsetY;
      offsetT = initialOffsetT;
      LambdaSlider.value = 0;
      updateLambda();
      drawGrid();
    }

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.getElementById('resetButtonKot').addEventListener('click', handleResetButtonClick);

    // Prevent the context menu from appearing during right-click and drag
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    // Initial draw of the coordinate system
    drawGrid();
})();