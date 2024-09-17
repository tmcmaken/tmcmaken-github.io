
(function() {
    // Get the canvas element
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Initial position and rotation of the grid
    const w = canvas.width;
    const h = canvas.height;
    const initialOffsetX = w / 2;
    const initialOffsetY = h / 2;
    const initialRotationAngle = 0;

    // Store the current position and rotation of the grid
    let offsetX = initialOffsetX;
    let offsetY = initialOffsetY;
    let rotationAngle = initialRotationAngle;

    // Store the mouse coordinates
    let startX;
    let startY;
    let isDragging = false;
    let isRotating = false;

// Function to apply a radial gradient to the canvas
function applyRadialGradientMask(ctx) {
  // Create a radial gradient
  const gradient = ctx.createRadialGradient(
    initialOffsetX, // center x-coordinate
    initialOffsetY, // center y-coordinate
    w * 0.4, // inner radius
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

      // Translate and rotate the entire grid
      ctx.translate(offsetX, offsetY);
      ctx.rotate(rotationAngle);

      // Draw the horizontal grid lines
      for (let y = -h * 100; y <= h * 100; y += 20) {
        ctx.beginPath();
        ctx.moveTo(-w * 100, y);
        ctx.lineTo(w * 100, y);
        ctx.stroke();
      }

      // Draw the vertical grid lines
      for (let x = -w * 100; x <= w * 100; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, -h * 100);
        ctx.lineTo(x, h * 100);
        ctx.stroke();
      }

      // Set the stroke to be thicker for the axes
      ctx.lineWidth = 2;

      // Draw the x-axis
      ctx.beginPath();
      ctx.moveTo(-w * 100, 0);
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
  const wavelength = 2 * Math.PI; // Wavelength of the sinusoidal line
  const frequency = 2 * Math.PI / wavelength;

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  for (let t = 0; t <= 2000; t += 0.01) {
    const x = startX + t + amplitude * Math.sin(frequency * t);
    const y = startY - t + amplitude * Math.sin(frequency * t);
    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(startX, startY);

  for (let t = 0; t <= 2000; t += 0.01) {
    const x = startX - t - amplitude * Math.sin(frequency * t);
    const y = startY - t + amplitude * Math.sin(frequency * t);
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
  ctx.fillText('x', 0.9 * w, 0.53 * h);

      // Draw the fixed axes
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(-w * 100, h / 2);
      ctx.lineTo(w * 100, h / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2, -h * 100);
      ctx.lineTo(w / 2, h * 100);
      ctx.stroke();

      // Draw the radial gradient mask
      applyRadialGradientMask(ctx);
    }

    // Function to handle mouse down event
    function handleMouseDown(e) {
      startX = e.pageX - canvas.offsetLeft;
      startY = e.pageY - canvas.offsetTop;

      // Check if right-click
      if (e.button === 2) {
        isRotating = true;
      } else {
        isDragging = true;
      }
    }

    // Function to handle mouse move event
    function handleMouseMove(e) {
      const mouseX = e.pageX - canvas.offsetLeft;
      const mouseY = e.pageY - canvas.offsetTop;

      // Calculate the angle of the cursor from the origin
      const angle = Math.atan2(mouseY - offsetY, mouseX - offsetX);

      if (isDragging) {
        // Update the offset position
        offsetX += mouseX - startX;
        offsetY += mouseY - startY;
      } else if (isRotating) {
        // Calculate the delta angle
        const deltaAngle = angle - Math.atan2(startY - offsetY, startX - offsetX);

        // Update the rotation angle
        rotationAngle += deltaAngle;
      }

      // Redraw the coordinate system with the updated translation or rotation
      drawGrid();

      // Update the start position for the next move
      startX = mouseX;
      startY = mouseY;
    }

    // Function to handle mouse up event
    function handleMouseUp(e) {
      if (isRotating) {
        // Prevent the context menu from appearing during right-click and drag
        e.preventDefault();
      }
      isDragging = false;
      isRotating = false;
    }

    // Function to handle reset button click event
    function handleResetButtonClick() {
      offsetX = initialOffsetX;
      offsetY = initialOffsetY;
      rotationAngle = initialRotationAngle;
      drawGrid();
    }

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.getElementById('resetButton').addEventListener('click', handleResetButtonClick);

    // Prevent the context menu from appearing during right-click and drag
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    // Initial draw of the coordinate system
    drawGrid();
})();