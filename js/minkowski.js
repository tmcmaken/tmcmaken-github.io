
(function() {
    // Get the canvas element
    const canvas = document.getElementById('canvasMin');
    const ctx = canvas.getContext('2d');

    // Initial position and skew of the grid
    const w = canvas.width;
    const h = canvas.height;
    const initialOffsetX = w / 2;
    const initialOffsetY = h / 2;
    const initialOffsetT = 0;
    const initialBoost = 0;

    // Store the current position and skew of the grid
    let offsetX = initialOffsetX;
    let offsetY = initialOffsetY;
    let offsetT = initialOffsetT;
    let boostParameter = initialBoost;

    // Store the mouse coordinates
    let startX;
    let startY;
    let isDragging = false;
    let isBoosting = false;

    // Functions to transform into Penrose coordinates
    function pR(x,y) {
      const r = x;
      const t = y;
      const R = (w / 4) * (Math.tanh(r+t) + Math.tanh(r-t));
      return R;
    }
    function pT(x,y) {
      const r = x;
      const t = y;
      const T = (h / 4) * (Math.tanh(r+t) - Math.tanh(r-t)); 
      return T;
    }

    // Function to draw the coordinate system with the grid
    function drawGrid() {
      ctx.clearRect(0, 0, w, h);

      // Set the stroke color to white
      ctx.strokeStyle = 'white';

      // Save the canvas state
      ctx.save();

      // Calculate the boost parameter between (-1,1) to prevent further skewing
      boostParameter = Math.min(boostParameter, 1);
      boostParameter = Math.max(boostParameter, -1);

      // Translate the entire grid
      ctx.translate(w / 2, h / 2);
      // ctx.transform(1, -boostParameter, -boostParameter, 1, 0, 0);

      // Draw the constant-t grid lines
      for (let t = -10.035 + offsetT; t <= 10; ) {
        ctx.beginPath();
        ctx.moveTo(pR(-boostParameter * t / Math.sqrt(1 - Math.pow(boostParameter, 2)), t / Math.sqrt(1 - Math.pow(boostParameter, 2))), pT(-boostParameter * t / Math.sqrt(1 - Math.pow(boostParameter, 2)), t / Math.sqrt(1 - Math.pow(boostParameter, 2))));
        for (let r = 0; r <= 10; r += 0.01) {
          let x = (r - boostParameter * t) / Math.sqrt(1 - Math.pow(boostParameter, 2));
          let y = (t - boostParameter * r) / Math.sqrt(1 - Math.pow(boostParameter, 2));
          ctx.lineTo(pR(x, y), pT(x, y));
        }
        ctx.stroke();
        t += Math.atanh(1/10);
      }

      // Draw the constant-r grid lines
      for (let r = 0; r <= 10; ) {
        ctx.beginPath();
        ctx.moveTo(pR(r, -10), pT(r, -10));
        for (let t = -10.035 + offsetT; t <= 10; t += 0.01) {
          let x = (r - boostParameter * t) / Math.sqrt(1 - Math.pow(boostParameter, 2));
          let y = (t - boostParameter * r) / Math.sqrt(1 - Math.pow(boostParameter, 2));
          ctx.lineTo(pR(x, y), pT(x, y));
        }
        ctx.stroke();
        r += Math.atanh(1/10);
      }

      // Set the stroke to be thicker for the axes
      ctx.lineWidth = 2;

      // Draw the x-axis
      ctx.beginPath();
      ctx.moveTo(pR(-boostParameter * offsetT / Math.sqrt(1 - Math.pow(boostParameter, 2)), offsetT / Math.sqrt(1 - Math.pow(boostParameter, 2))), pT(-boostParameter * offsetT / Math.sqrt(1 - Math.pow(boostParameter, 2)), offsetT / Math.sqrt(1 - Math.pow(boostParameter, 2))));
      for (let r = 0; r <= 10; r += 0.01 ) {
         let x = (r - boostParameter * offsetT) / Math.sqrt(1 - Math.pow(boostParameter, 2));
         let y = (offsetT - boostParameter * r) / Math.sqrt(1 - Math.pow(boostParameter, 2));
         ctx.lineTo(pR(x, y), pT(x, y));
      }
      ctx.stroke();

      // Draw the y-axis
      ctx.beginPath();
      ctx.moveTo(pR(0, -10), pT(0, -10));
      for (let t = -10; t <= 10; t += 0.01 ) {
         let x = (-boostParameter * (t + offsetT)) / Math.sqrt(1 - Math.pow(boostParameter, 2));
         let y = (t + offsetT) / Math.sqrt(1 - Math.pow(boostParameter, 2));
         ctx.lineTo(pR(x, y), pT(x, y));
      }
      ctx.stroke();

// Set the stroke color to yellow
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'yellow';

  // Draw the sinusoidal line
  const startX = Math.atanh(2/5);
  const startY = 0;

  const amplitude = 0.01; // Amplitude of the sinusoidal line
  const wavelength = 0.05; // Wavelength of the sinusoidal line
  const frequency = 2 * Math.PI / wavelength;

  // Draw the outgoing ray
  ctx.beginPath();
  ctx.moveTo(pR((startX - boostParameter * (startY + offsetT)) / Math.sqrt(1 - Math.pow(boostParameter, 2)), (startY + offsetT - boostParameter * startX) / Math.sqrt(1 - Math.pow(boostParameter, 2))), pT((startX - boostParameter * (startY + offsetT)) / Math.sqrt(1 - Math.pow(boostParameter, 2)), (startY + offsetT - boostParameter * startX) / Math.sqrt(1 - Math.pow(boostParameter, 2))));
  for (let s = 0; s <= 10; s += 0.01) {
    const r = startX + s + amplitude * Math.sin(frequency * s);
    const t = startY + offsetT - s + amplitude * Math.sin(frequency * s);
    const x = (r - boostParameter * t) / Math.sqrt(1 - Math.pow(boostParameter, 2));
    const y = (t - boostParameter * r) / Math.sqrt(1 - Math.pow(boostParameter, 2));
    ctx.lineTo(pR(x, y), pT(x, y));
  }
  ctx.stroke();

  // Draw the (initially) ingoing ray
  ctx.beginPath();
  ctx.moveTo(pR((startX - boostParameter * (startY + offsetT)) / Math.sqrt(1 - Math.pow(boostParameter, 2)), (startY + offsetT - boostParameter * startX) / Math.sqrt(1 - Math.pow(boostParameter, 2))), pT((startX - boostParameter * (startY + offsetT)) / Math.sqrt(1 - Math.pow(boostParameter, 2)), (startY + offsetT - boostParameter * startX) / Math.sqrt(1 - Math.pow(boostParameter, 2))));
  for (let s = 0; s <= Math.atanh(2/5); s += 0.01) {
    const r = startX - s - amplitude * Math.sin(frequency * s);
    const t = startY + offsetT - s + amplitude * Math.sin(frequency * s);
    const x = (r - boostParameter * t) / Math.sqrt(1 - Math.pow(boostParameter, 2));
    const y = (t - boostParameter * r) / Math.sqrt(1 - Math.pow(boostParameter, 2));
    ctx.lineTo(pR(x, y), pT(x, y));  
  }

  for (let s = 0; s <= 10; s += 0.01) {
    const r = startX - Math.atanh(2/5) + s + amplitude * Math.sin(frequency * s);
    const t = startY - Math.atanh(2/5) + offsetT - s + amplitude * Math.sin(frequency * s);
    const x = (r - boostParameter * t) / Math.sqrt(1 - Math.pow(boostParameter, 2));
    const y = (t - boostParameter * r) / Math.sqrt(1 - Math.pow(boostParameter, 2));
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
  ctx.fillText('T', 0.43 * w, 0.03 * h);
  ctx.fillText('R', 0.98 * w, 0.57 * h);

      // Draw the fixed axes
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(pR(0,0) + w/2, pT(0,0)+ h/2);
      ctx.lineTo(pR(100*w,0) + w/2, pT(100*w,0) + h/2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pR(0,-h*100) + w/2, pT(0,-h*100) + h/2);
      ctx.lineTo(pR(0,h*100) + w/2, pT(0,h*100) + h/2);
      ctx.stroke();

      // Add text for boost parameter
      ctx.font = 'italic 18px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('v = ' + boostParameter.toFixed(2) + "c", w/4, h/2);
    }

    // Function to handle mouse down event
    function handleMouseDown(e) {
      startX = e.pageX - canvas.offsetLeft;
      startY = e.pageY - canvas.offsetTop;

      // Check if right-click
      if (e.button === 2) {
        isBoosting = true;
      } else {
        isDragging = true;
      }
    }

    // Function to handle mouse move event
    function handleMouseMove(e) {
      const mouseX = e.pageX - canvas.offsetLeft;
      const mouseY = e.pageY - canvas.offsetTop;

      if (isDragging) {
        // Update the offset position
        offsetX += mouseX - startX;
        offsetY += mouseY - startY;
        offsetT += (mouseY - startY) / 250;
      } else if (isBoosting) {
        // Calculate the delta boost parameter
      const deltaBoostParameter = (mouseX - startX) / w;

        // Update the boost parameter
      boostParameter += deltaBoostParameter;
      }

        // Limit the boost parameter to the range (-1,1)
        boostParameter = Math.min(boostParameter, 1);
        boostParameter = Math.max(boostParameter, -1);

      // Redraw the coordinate system with the updated translation or boost
      drawGrid();

      // Update the start position for the next move
      startX = mouseX;
      startY = mouseY;
    }

    // Function to handle mouse up event
    function handleMouseUp(e) {
      if (isBoosting) {
        // Prevent the context menu from appearing during right-click and drag
        e.preventDefault();
      }
      isDragging = false;
      isBoosting = false;
    }

    // Function to handle reset button click event
    function handleResetButtonClick() {
      offsetX = initialOffsetX;
      offsetY = initialOffsetY;
      offsetT = initialOffsetT;
      boostParameter = initialBoost;
      drawGrid();
    }

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.getElementById('resetButtonMin').addEventListener('click', handleResetButtonClick);

    // Prevent the context menu from appearing during right-click and drag
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    // Initial draw of the coordinate system
    drawGrid();
})();