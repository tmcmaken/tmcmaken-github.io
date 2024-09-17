
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
    const canvas = document.getElementById('canvasOpp');
    const ctx = canvas.getContext('2d');

    // Initial position and skew of the grid
    const w = canvas.width;
    const h = canvas.height;
    const initialOffsetX = w / 2;
    const initialOffsetY = h / 2;
    const initialOffsetT = 0;

    // Surface of the collapsing star
    const rhoB = 10;
    const tB = 0;


    // Store the current position and skew of the grid
    let offsetX = initialOffsetX;
    let offsetY = initialOffsetY;
    let offsetT = initialOffsetT;

    // Store the mouse coordinates
    let startX;
    let startY;
    let isDragging = false;

    // Function to calculate time t of free-fall shell
    function tFF(r) {
      const t = 2 - 2*Math.log(Math.abs((1+Math.pow(r/2, 1/2))/(1-Math.pow(r/2, 1/2)))) + Math.pow(2*r, 1/2) * (2 + r/3);
      return -t;
    }

    // Functions to transform into FLRW Penrose coordinates
    function fpm(chi,pm) {
	const x = chi / rhoB;
	return pm*(Math.pow(x, 3)/6 + (3/2)*x - 2 + offsetT) - (5/3) + 4*Math.log(Math.abs((3-(pm*x))/2));
    }
    function rH(eta) {
	if (eta > -2 * rhoB) {
		return 2;
	} else {
		return (Math.pow(eta/rhoB, 3) + 3*Math.pow(eta/rhoB, 2)) / 2;
	}
    }
    function pROpp(r,eta) {
	const rho = r * 2 * Math.pow(rhoB, 3) / Math.pow(eta, 2);
	const rK = (Math.pow(Math.E, fpm(eta+rho,1)/4) + Math.sign(r - rH(eta)) * Math.pow(Math.E, fpm(eta-rho,-1)/4)) / 2;
	const tK = (Math.pow(Math.E, fpm(eta+rho,1)/4) - Math.sign(r - rH(eta)) * Math.pow(Math.E, fpm(eta-rho,-1)/4)) / 2;
	const R = (2*w / 3) * (Math.atan(rK+tK) + Math.atan(rK-tK)) / Math.PI - w / 6;
	return R;
    }
    function pTOpp(r,eta) {
	const rho = r * 2 * Math.pow(rhoB, 3) / Math.pow(eta, 2);
	const rK = (Math.pow(Math.E, fpm(eta+rho,1)/4) + Math.sign(r - rH(eta)) * Math.pow(Math.E, fpm(eta-rho,-1)/4)) / 2;
	const tK = (Math.pow(Math.E, fpm(eta+rho,1)/4) - Math.sign(r - rH(eta)) * Math.pow(Math.E, fpm(eta-rho,-1)/4)) / 2;
	const T = -(2*h / 3) * (Math.atan(rK+tK) - Math.atan(rK-tK)) / Math.PI;
	return T;
    }

    // Functions to transform into exterior Schwarzschild Penrose coordinates
    function pRext(r,t) {
      const rK = Math.pow(r/2-1, 1/2) * Math.pow(Math.E, r/4) * Math.cosh(t/4);
      const tK = Math.pow(r/2-1, 1/2) * Math.pow(Math.E, r/4) * Math.sinh(t/4);
      const R = (2*w / 3) * (Math.atan(rK+tK) + Math.atan(rK-tK)) / Math.PI - w / 6;
      return R;
    }
    function pText(r,t) {
      const rK = Math.pow(r/2-1, 1/2) * Math.pow(Math.E, r/4) * Math.cosh(t/4);
      const tK = Math.pow(r/2-1, 1/2) * Math.pow(Math.E, r/4) * Math.sinh(t/4);
      const T = -(2*h / 3) * (Math.atan(rK+tK) - Math.atan(rK-tK)) / Math.PI; 
      return T;
    }

    // Functions to transform into interior Penrose coordinates
    function pRint(r,t) {
      const rK = Math.pow(1-r/2, 1/2) * Math.pow(Math.E, r/4) * Math.sinh(t/4);
      const tK = Math.pow(1-r/2, 1/2) * Math.pow(Math.E, r/4) * Math.cosh(t/4);
      const R = (2*w / 3) * (Math.atan(rK+tK) + Math.atan(rK-tK)) / Math.PI - w / 6;
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
      for (let t = -100.8 + offsetT; t <= 20; ) {
        let eta0 = -rhoB * Math.pow(2*Math.pow((-t+offsetT-2.5),3/4), 1/2);
        ctx.beginPath();
        ctx.moveTo(pRext(0, t), pText(0, t));
        if (t - offsetT > tFF(10)) {
        for (let r = 10; t-offsetT >= tFF(r);) {
          let x = r;
          let y = t;
          eta0 = -rhoB * Math.pow(2*r, 1/2);
          ctx.lineTo(pRext(x, y), pText(x, y));
          r = r - 0.002;
        }
        }
        ctx.moveTo(pROpp(Math.pow(eta0/rhoB,2)/2,eta0), pTOpp(Math.pow(eta0/rhoB,2)/2,eta0));
        for (let s = Math.pow(eta0/rhoB,2)/2; s >= 0;) {
          const x = s;
          const y = eta0;
          ctx.lineTo(pROpp(x, y), pTOpp(x, y)); 
          s = s - 0.03;
        }
        ctx.stroke();
        t += 1.6;
      }

      // Draw the interior constant-t grid lines
      for (let t = tFF(0) + offsetT; t <= 20; ) {
        let eta0;
        ctx.beginPath();
        ctx.moveTo(pRint(0, t), pTint(0, t));
        for (let r = 0; t-offsetT >= tFF(r); r += 0.002) {
          let x = r;
          let y = t;
          eta0 = -rhoB * Math.pow(2*r, 1/2);
          ctx.lineTo(pRint(x, y), pTint(x, y));
        }
        ctx.moveTo(pROpp(Math.pow(eta0/rhoB,2)/2,eta0), pTOpp(Math.pow(eta0/rhoB,2)/2,eta0));
        for (let s = Math.pow(eta0/rhoB,2)/2; s >= 0;) {
          const x = s;
          const y = eta0;
          ctx.lineTo(pROpp(x, y), pTOpp(x, y)); 
          s = s - 0.002;
        }
        ctx.stroke();
        t += 1.6;
      }

      // Draw the exterior constant-r grid lines
      for (let r = 2.08; r <= 15; ) {
        ctx.beginPath();
        ctx.moveTo(pRext(r, 40-offsetT), pText(r, 40-offsetT));
        for (let t = 40 - offsetT; t-offsetT >= tFF(r);) {
          let x = r;
          let y = t;
          ctx.lineTo(pRext(x, y), pText(x, y));
          t = t - 0.1;
        }
        let eta0 = -rhoB * Math.pow(2*r, 1/2);
        ctx.moveTo(pROpp(r,eta0), pTOpp(r,eta0));
        for (let s = eta0; s >= -rhoB*10;) {
          const x = r;
          const y = s;
          ctx.lineTo(pROpp(x, y), pTOpp(x, y)); 
          s = s - 0.1;
        }
        ctx.stroke();
        r += 0.32;
      }

      // Draw the interior constant-r grid lines
      for (let r = 0; r <= 2; ) {
        ctx.beginPath();
        ctx.moveTo(pRint(r, 40), pTint(r, 40));
        for (let t = 40 - offsetT; t-offsetT >= tFF(r);) {
          let x = r;
          let y = t;
          ctx.lineTo(pRint(x, y), pTint(x, y));
          t = t - 0.1;
        }
        let eta0 = -rhoB * Math.pow(2*r, 1/2);
        for (let s = eta0; s >= -rhoB*10;) {
          const x = r;
          const y = s;
          ctx.lineTo(pROpp(x, y), pTOpp(x, y)); 
          s = s - 0.1;
        }
        ctx.stroke();
        r += 0.32;
      }

/*
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
    const t = startY + offsetT + s - amplitude * Math.sin(frequency * s);
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
    const t = startY + offsetT + s - amplitude * Math.sin(frequency * s);
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
    const t = startY + offsetT - s + amplitude * Math.sin(frequency * s);
    const x = r;
    const y = t;
    ctx.lineTo(pRint(x, y), pTint(x, y));  
  }
  ctx.stroke();
*/

  // Set the stroke to be thicker for the axes
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';

  // Draw the t=0 axis
  let eta0;
  ctx.beginPath();
  ctx.moveTo(pRext(10, offsetT), pText(10, offsetT));
  for (let r = 10; 0 >= tFF(r);) {
     let x = r;
     let y = offsetT;
     eta0 = -rhoB * Math.pow(2*r, 1/2);
     ctx.lineTo(pRext(x, y), pText(x, y));
     r = r - 0.01;
  }
  ctx.moveTo(pROpp(Math.pow(eta0/rhoB,2)/2,eta0), pTOpp(Math.pow(eta0/rhoB,2)/2,eta0));
  for (let s = Math.pow(eta0/rhoB,2)/2; s >= 0;) {
    const x = s;
    const y = eta0;
    ctx.lineTo(pROpp(x, y), pTOpp(x, y)); 
    s = s - 0.002;
  }

  ctx.stroke();

  // Draw the r=0 axis
  ctx.beginPath();
  ctx.moveTo(pRint(0, 100), pTint(0, 100));     
  ctx.lineTo(pROpp(0, -3*rhoB), pTOpp(0, -3*rhoB));
  ctx.moveTo(pROpp(2, -2*rhoB), pTOpp(2, -2*rhoB));
  for (let s = -2*rhoB; s >= -20*rhoB;) {
    ctx.lineTo(pROpp(2, s), pTOpp(2, s)); 
    s = s - 0.1;
  }
  ctx.stroke();

// Draw the r=2M axis
  ctx.beginPath();
  ctx.moveTo(pRint(0, 100), pTint(0, 100));     
  ctx.lineTo(pRint(0, tFF(0)+offsetT), pTint(0, tFF(0)+offsetT));
  for (let s = 0; s >= -rhoB*20;) {
    ctx.lineTo(pROpp(0, s), pTOpp(0, s)); 
    s = s - 0.1;
  }
  ctx.stroke();

  // Set the stroke color to red
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';

  // Draw the collapsing shell
  const startr = 50;
  const startt = -100;
  ctx.beginPath();
  ctx.moveTo(pRext(startr, startt), pText(startr, startt));
  for (let s = startr; s >= 2;) {
    const r = s;
    const t = offsetT + tFF(s);
    const x = r;
    const y = t;
    ctx.lineTo(pRext(x, y), pText(x, y));  
    s = s - 0.1;
  }
    const r = 2.001;
    const t = offsetT + tFF(r);
    ctx.lineTo(pRext(r, t), pText(r, t));  
  for (let s = 2; s >= 0;) {
    const r = s;
    const t = offsetT + tFF(s);
    const x = r;
    const y = t;
    ctx.lineTo(pRint(x, y), pTint(x, y));  
    s = s - 0.01;
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
  if (offsetT < 10) {
    ctx.fillText('r = 0', (0.35 + Math.tanh(Math.max(offsetT/5,0))*0.22) * w, 0.12 * h);
  }
  ctx.fillText('t\u2192\u221E', 0.68 * w, 0.12 * h);
  ctx.fillText('t\u2192\u2013\u221E', 0.67 * w, 0.88 * h);
  ctx.fillText('r\u2192\u221E', 0.95 * w, 0.62 * h);
  ctx.fillText('r = 0', (0.25 + Math.tanh(Math.max(offsetT,0)/30)*0.48) * w, 0.5 * h);


//  ctx.fillText(Math.pow(1-r0/2, 1/2) * Math.pow(Math.E, r0/4) * Math.sinh(-2/4), 0.2 * w, 0.8 * h);
//  ctx.fillText(Math.pow(1-r0/2, 1/2) * Math.pow(Math.E, r0/4) * Math.cosh(-2/4), 0.2 * w, 0.85 * h);
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
           offsetT += -(mouseY - startY) / 22;
        } else {
           offsetT += (mouseX - startX) / 22;
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
    document.getElementById('resetButtonOpp').addEventListener('click', handleResetButtonClick);

    // Prevent the context menu from appearing during right-click and drag
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    // Initial draw of the coordinate system
    drawGrid();
})();
