
(function() {

function LambertW(z) {
  // Define the tolerance for convergence
  const tolerance = 1e-10;
  // Maximum number of iterations
  const maxIterations = 100;
  // Initial guess
  let w = Math.log(Math.max(z, 1e-6));
  // Halley's method iteration
  for (let i = 0; i < maxIterations; i++) {
    const numerator = w * Math.exp(w) - z;
    const denominator = Math.exp(w) * (w + 1);
    const delta = numerator / denominator;
    w = w - delta;
    // Check for convergence
    if (Math.abs(delta) < tolerance) {
      break;
    }
  } 
  return w;
}

function LambertW0(z) {
  // Check if the argument is outside the principal branch range
  if (z < -1 / Math.E) {
    throw new Error("Invalid argument for Lambert-W function (W0 branch).");
  }
  // Define the tolerance for convergence
  const tolerance = 1e-12;
  // Maximum number of iterations
  const maxIterations = 100;
  // Series expansion to approximate W0 for small positive values of z
  let w = z;
  let term = z;
  let n = 2; // Start with n = 2 to account for the second term
  while (Math.abs(term) > tolerance && n < maxIterations) {
    term *= -z * (n - 1) / n;
    w += term;
    n += 1;
  }
  return w;
}

    // Get the canvas element
    const canvas = document.getElementById('canvasSch');
    const ctx = canvas.getContext('2d');

    // Initial position and skew of the grid
    const w = canvas.width;
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

    // Functions to transform into Penrose coordinates
    function pRext(r,t) {
      const rK = Math.pow(r/2-1, 1/2) * Math.pow(Math.E, r/4) * Math.cosh(t/4);
      const tK = Math.pow(r/2-1, 1/2) * Math.pow(Math.E, r/4) * Math.sinh(t/4);
      const R = (2*w / 3) * (Math.atan(rK+tK) + Math.atan(rK-tK)) / Math.PI - w / 6;
      return R;
    }
    function pText(r,t) {
      const rK = Math.pow(r/2-1, 1/2) * Math.pow(Math.E, r/4) * Math.cosh(t/4);
      const tK = Math.pow(r/2-1, 1/2) * Math.pow(Math.E, r/4) * Math.sinh(t/4);
      const T = (2*h / 3) * (Math.atan(rK+tK) - Math.atan(rK-tK)) / Math.PI; 
      return T;
    }

    // Functions to transform into interior Penrose coordinates
    function pRint(r,t) {
      const rK = Math.pow(1-r/2, 1/2) * Math.pow(Math.E, r/4) * Math.sinh(t/4);
      const tK = Math.pow(1-r/2, 1/2) * Math.pow(Math.E, r/4) * Math.cosh(t/4);
      const R = -(2*w / 3) * (Math.atan(rK+tK) + Math.atan(rK-tK)) / Math.PI - w / 6;
      return R;
    }
    function pTint(r,t) {
      const rK = Math.pow(1-r/2, 1/2) * Math.pow(Math.E, r/4) * Math.sinh(t/4);
      const tK = Math.pow(1-r/2, 1/2) * Math.pow(Math.E, r/4) * Math.cosh(t/4);
      const T = -(2*h / 3) * (Math.atan(rK+tK) - Math.atan(rK-tK)) / Math.PI; 
      return T;
    }


    // Function to draw the coordinate system with the grid
    function drawGrid() {
      ctx.clearRect(0, 0, w, h);

      // Set the stroke color to white
      ctx.strokeStyle = 'white';

      // Save the canvas state
      ctx.save();

      // Translate the entire grid
      ctx.translate(w / 2, h / 2);
      
      // Draw the exterior constant-t grid lines
      for (let t = -100.035 + offsetT; t <= 60; ) {
        ctx.beginPath();
        ctx.moveTo(pRext(0, t), pText(0, t));
        for (let r = 0; r <= 10; r += 0.01) {
          let x = r;
          let y = t;
          ctx.lineTo(pRext(x, y), pText(x, y));
        }
        ctx.stroke();
        t += 0.8;
      }

      // Draw the interior constant-t grid lines
      for (let t = -100.035 + offsetT; t <= 60; ) {
        ctx.beginPath();
        ctx.moveTo(pRint(0, t), pTint(0, t));
        for (let r = 0; r <= 2; r += 0.005) {
          let x = r;
          let y = t;
          ctx.lineTo(pRint(x, y), pTint(x, y));
        }
        ctx.stroke();
        t += 0.8;
      }

      // Draw the exterior constant-r grid lines
      for (let r = 0; r <= 15; ) {
        ctx.beginPath();
        ctx.moveTo(pRext(r, -10), pText(r, -10));
        for (let t = -100.035 + offsetT; t <= 60; t += 0.1) {
          let x = r;
          let y = t;
          ctx.lineTo(pRext(x, y), pText(x, y));
        }
        ctx.stroke();
        r += 0.16;
      }

      // Draw the interior constant-r grid lines
      for (let r = 0; r <= 10; ) {
        ctx.beginPath();
        ctx.moveTo(pRint(r, -10), pTint(r, -10));
        for (let t = -100.035 + offsetT; t <= 60; t += 0.1) {
          let x = r;
          let y = t;
          ctx.lineTo(pRint(x, y), pTint(x, y));
        }
        ctx.stroke();
        r += 0.16;
      }


// Set the stroke color to yellow
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'yellow';

  // Draw the sinusoidal line
  const startX = 2.55;
  const startY = 0;

  const amplitude = 0.07; // Amplitude of the sinusoidal line
  const wavelength = 0.4; // Wavelength of the sinusoidal line
  const frequency = 2 * Math.PI / wavelength;

  // Draw the outgoing ray
  ctx.beginPath();
  ctx.moveTo(pRext(startX, startY + offsetT), pText(startX, startY + offsetT));
  for (let s = 0.05; s <= 10; s += 0.01) {
    const r = 2 + 2 * (LambertW(Math.sqrt(Math.pow(Math.E, s + amplitude * Math.sin(frequency * s) - 2))));
    const t = startY + offsetT - s + amplitude * Math.sin(frequency * s);
    const x = r;
    const y = t;
    ctx.lineTo(pRext(x, y), pText(x, y));
  }
  ctx.stroke();

  // Draw the (exterior) ingoing ray
  ctx.beginPath();
  ctx.moveTo(pRext(startX, startY + offsetT), pText(startX, startY + offsetT));
  for (let s = 0; s <= 10; s += 0.01) {
    const r = 2 + 2 * (LambertW0(Math.sqrt(Math.pow(Math.E, -s - amplitude * Math.sin(frequency * s) - 2))));
    const t = startY + offsetT - s + amplitude * Math.sin(frequency * s);
    const x = r;
    const y = t;
    ctx.lineTo(pRext(x, y), pText(x, y));  
  }
  ctx.stroke();

  // Draw the (interior) ingoing ray
  ctx.beginPath();
  ctx.moveTo(pRint(2.01, startY + offsetT), pTint(2.01, startY + offsetT));
  for (let s = -10; s <= 0; s += 0.01) {
    const r = 2 + 2 * (LambertW0(-Math.sqrt(Math.pow(Math.E, s + amplitude * Math.sin(frequency * s) - 2))));
    const t = startY + offsetT + s - amplitude * Math.sin(frequency * s);
    const x = r;
    const y = t;
    ctx.lineTo(pRint(x, y), pTint(x, y));  
  }
  ctx.stroke();

  // Set the stroke to be thicker for the axes
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';

  // Draw the x-axis
  ctx.beginPath();
  ctx.moveTo(pRext(0, offsetT), pText(0, offsetT));
  for (let r = 0; r <= 10; r += 0.1 ) {
     let x = r;
     let y = offsetT;
     ctx.lineTo(pRext(x, y), pText(x, y));
  }
  ctx.stroke();

  // Draw the y-axis
  ctx.beginPath();
  ctx.moveTo(pRext(0, -100), pText(0, -100));
  for (let t = -100; t <= 100; t += 1 ) {
     let x = 0;
     let y = t + offsetT;
     ctx.lineTo(pRext(x, y), pText(x, y));
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
  ctx.fillText('r = 0', 0.33 * w, 0.12 * h);
  ctx.fillText('t\u2192\u221E', 0.68 * w, 0.12 * h);
  ctx.fillText('t\u2192\u2013\u221E', 0.67 * w, 0.88 * h);
  ctx.fillText('r\u2192\u221E', 0.95 * w, 0.62 * h);
  ctx.fillText('r = r', 0.28 * w, 0.53 * h);
  ctx.font = 'italic 12px Cambria';
  ctx.fillText('s', 0.325 * w, 0.545 * h);



      // Draw the fixed axes
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(pRext(2,0) + w/2, pText(2,0)+ h/2);
      ctx.lineTo(pRext(100,0) + w/2, pText(100,0) + h/2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pRint(0,0) + w/2, pTint(0,0) + h/2);
      ctx.lineTo(pRint(2,0) + w/2, pTint(2,0) + h/2);
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
        if (startX + startY > 1000/3) {
           offsetT += (mouseY - startY) / 22;
        } else {
           offsetT += -(mouseX - startX) / 22;
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

    // Function to handle reset button click event
    function handleResetButtonClick() {
      offsetX = initialOffsetX;
      offsetY = initialOffsetY;
      offsetT = initialOffsetT;
      drawGrid();
    }

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.getElementById('resetButtonSch').addEventListener('click', handleResetButtonClick);

    // Prevent the context menu from appearing during right-click and drag
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    // Initial draw of the coordinate system
    drawGrid();
})();