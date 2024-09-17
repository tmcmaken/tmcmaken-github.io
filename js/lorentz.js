
(function() {
    // Get the canvas element
    const canvas = document.getElementById('canvasLor');
    const ctx = canvas.getContext('2d');

    // Initial position and skew of the grid
    const w = canvas.width;
    const h = canvas.height;
    const initialOffsetX = w / 2;
    const initialOffsetY = h / 2;
    const initialBoost = 0;

    // Store the current position and skew of the grid
    let offsetX = initialOffsetX;
    let offsetY = initialOffsetY;
    let boostParameter = initialBoost;

    // Store the mouse coordinates
    let startX;
    let startY;
    let isDragging = false;
    let isBoosting = false;

// Function to apply a radial gradient to the canvas
function applyRadialGradientMask(ctx) {
  // Create a radial gradient
  const gradient = ctx.createRadialGradient(
    initialOffsetX, // center x-coordinate
    initialOffsetY, // center y-coordinate
    w * 0.45, // inner radius
    initialOffsetX, // center x-coordinate
    initialOffsetY, // center y-coordinate
    w * 0.5// outer radius
  );

  // Add color stops to the gradient
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // fully transparent black at inner radius
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)'); // fully opaque black at outer radius

  // Apply the gradient as a global composite operation
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Reset the global composite operation
  ctx.globalCompositeOperation = 'source-over';
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

      // Translate and boost the entire grid
	let gam;
      if (boostParameter < 1) {
		gam = Math.pow(1 - Math.pow(boostParameter, 2), -1/2);
	} else {
		gam = 9999;
	}
      ctx.translate(-boostParameter * offsetY + w / 2, offsetY);
      ctx.transform(gam, -boostParameter * gam, -boostParameter * gam, gam, w / 2 * boostParameter, 0);

      // Draw the horizontal grid lines
      for (let y = -h * 100; y <= h * 100; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w * 100, y);
        ctx.stroke();
      }

      // Draw the vertical grid lines
      for (let x = 0; x <= w * 100; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, -h * 100);
        ctx.lineTo(x, h * 100);
        ctx.stroke();
      }

      // Set the stroke to be thicker for the axes
      ctx.lineWidth = 2;

      // Draw the x-axis
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 100, 0);
      ctx.stroke();

      // Draw the y-axis
      ctx.beginPath();
      ctx.moveTo(0, -h * 100);
      ctx.lineTo(0, h * 100);
      ctx.stroke();

// Set the stroke color to yellow
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'yellow';

  // Draw the sinusoidal line
  const startX = 80;
  const startY = 0;

  const amplitude = 1.5; // Amplitude of the sinusoidal line
  const wavelength = 10; // Wavelength of the sinusoidal line
  const frequency = 2 * Math.PI / wavelength;

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  for (let t = 0; t <= 2000; t += 0.01) {
    const x = startX + t + amplitude * Math.sin(t);
    const y = startY - t + amplitude * Math.sin(t);
    ctx.lineTo(x, y);
  }

  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  for (let t = 0; t <= 80; t += 0.01) {
    const x = startX - t - amplitude * Math.sin(t);
    const y = startY - t + amplitude * Math.sin(t);
    ctx.lineTo(x, y);
  }
  for (let t = 0; t <= 2000; t += 0.01) {
    const x = startX - 80 + t + amplitude * Math.sin(t);
    const y = startY - 80 - t + amplitude * Math.sin(t);
    ctx.lineTo(x, y);
  }


  ctx.stroke();


      // Restore the canvas state
      ctx.restore();


  // Add text to label axes
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('t', 0.47 * w, 0.1 * h);
  ctx.fillText('r', 0.9 * w, 0.53 * h);

      // Draw the fixed axes
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(100 * w, h / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2, -h * 100);
      ctx.lineTo(w / 2, h * 100);
      ctx.stroke();

      // Draw the radial gradient mask
      applyRadialGradientMask(ctx);

      // Add text for boost parameter
      ctx.font = 'italic 18px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('v = ' + boostParameter.toFixed(2) + "c", w/4, h / 2);

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
      boostParameter = initialBoost;
      drawGrid();
    }

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.getElementById('resetButtonLor').addEventListener('click', handleResetButtonClick);

    // Prevent the context menu from appearing during right-click and drag
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    // Initial draw of the coordinate system
    drawGrid();
})();

