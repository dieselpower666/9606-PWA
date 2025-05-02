```javascript
// Cinematic Background Setup
const gridCanvas = document.getElementById('grid-canvas');
const gridCtx = gridCanvas.getContext('2d');

const beamCanvas = document.getElementById('beam-canvas');
const beamCtx = beamCanvas.getContext('2d');

function resizeCanvas() {
  gridCanvas.width = window.innerWidth;
  gridCanvas.height = window.innerHeight;
  beamCanvas.width = window.innerWidth;
  beamCanvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Grid + Beams Variables
let gridSpacing = 60;
let gridOffset = 0;
let beams = [];

function initializeBeams() {
  beams = [];
  for (let i = 0; i < 20; i++) {
    beams.push({
      x: Math.random() * beamCanvas.width,
      y: Math.random() * beamCanvas.height,
      width: Math.random() * 300 + 100,
      height: Math.random() * 10 + 3,
      speed: Math.random() * 1.5 + 1.0,
      color: Math.random() < 0.1 
        ? 'rgba(255,44,44,0.2)' 
        : (document.body.classList.contains('light-mode') 
          ? 'rgba(100,100,100,0.2)' 
          : 'rgba(255,255,255,0.2)'),
      baseAlpha: Math.random() * 0.3 + 0.2,
      alphaPulseSpeed: Math.random() * 0.005 + 0.003,
      alphaDirection: Math.random() > 0.5 ? 1 : -1,
      currentAlpha: 0
    });
  }
}

function drawGrid() {
  gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

  gridCtx.strokeStyle = document.body.classList.contains('light-mode') 
    ? "rgba(100,100,100,0.15)" 
    : "rgba(192,192,192,0.08)";

  gridCtx.lineWidth = 1;
  gridCtx.beginPath();
  for (let x = -gridSpacing + (gridOffset % gridSpacing); x < gridCanvas.width; x += gridSpacing) {
    gridCtx.moveTo(x, 0);
    gridCtx.lineTo(x, gridCanvas.height);
  }
  for (let y = -gridSpacing + (gridOffset % gridSpacing); y < gridCanvas.height; y += gridSpacing) {
    gridCtx.moveTo(0, y);
    gridCtx.lineTo(gridCanvas.width, y);
  }
  gridCtx.stroke();
}

function drawBeams() {
  beamCtx.clearRect(0, 0, beamCanvas.width, beamCanvas.height);

  beams.forEach(beam => {
    beam.currentAlpha += beam.alphaPulseSpeed * beam.alphaDirection;
    if (beam.currentAlpha > beam.baseAlpha + 0.2 || beam.currentAlpha < beam.baseAlpha - 0.1) {
      beam.alphaDirection *= -1;
    }

    const finalAlpha = Math.max(0, Math.min(1, beam.currentAlpha));
    beamCtx.fillStyle = beam.color.replace(/[\d\.]+\)$/g, `${finalAlpha})`);
    beamCtx.fillRect(beam.x, beam.y, beam.width, beam.height);

    beam.x += beam.speed;
    if (beam.x > beamCanvas.width) {
      beam.x = -beam.width;
      beam.y = Math.random() * beamCanvas.height;
      beam.color = Math.random() < 0.1 
        ? 'rgba(255,44,44,0.2)' 
        : (document.body.classList.contains('light-mode') 
          ? 'rgba(100,100,100,0.2)' 
          : 'rgba(255,255,255,0.2)');
      beam.baseAlpha = Math.random() * 0.3 + 0.2;
      beam.currentAlpha = beam.baseAlpha;
    }
  });
}

function animate() {
  gridOffset += 0.05;
  drawGrid();
  drawBeams();
  requestAnimationFrame(animate);
}

// INITIALIZE
initializeBeams();
animate();

// THEME TOGGLE
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const toggle = document.getElementById('theme-toggle');
  if (document.body.classList.contains('light-mode')) {
    toggle.textContent = "🌞";
  } else {
    toggle.textContent = "🌙";
  }
  initializeBeams();
}

// Property Address Validation Function
function validatePropertyAddress(address) {
  // Check if address is non-empty and has basic format (number + street name)
  if (!address || address.trim() === "") {
    return { valid: false, error: "Address cannot be empty" };
  }

  // Basic regex: At least a number followed by text (e.g., "123 Main St")
  const addressRegex = /^\d+\s+[A-Za-z\s]+/;
  if (!addressRegex.test(address.trim())) {
    return { valid: false, error: "Invalid address format. Please include street number and name (e.g., 123 Main St)" };
  }

  return { valid: true };
}

// Property Form Submission Handling
const form = document.getElementById('property-form');
const loadingSection = document.getElementById('loading-section');
const progressBar = document.getElementById('progress-bar');
const scanText = document.getElementById('scan-text');
const resultsDiv = document.getElementById('results');

const scanningPhrases = [
  "Analyzing property blueprint...",
  "Scanning logistics networks...",
  "Locating high-value tenants...",
  "Cross-referencing tax records...",
  "Predicting market trajectory...",
  "Extracting zoning information...",
  "Evaluating property valuation trends...",
  "Assessing neighborhood growth potential...",
  "Analyzing rental income projections...",
  "Checking historical sales data...",
  "Mapping nearby amenities impact...",
  "Reviewing local infrastructure plans...",
  "Estimating future appreciation rates...",
  "Analyzing demographic shifts...",
  "Inspecting environmental risk factors..."
];

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const address = document.getElementById('address').value;
  const loopnetUrl = document.getElementById('loopnet-url')?.value || '';

  // Validate property address before proceeding
  const validation = validatePropertyAddress(address);
  if (!validation.valid) {
    form.style.display = "none";
    loadingSection.classList.remove('hidden');
    loadingSection.style.display = 'block'; // Ensure visibility
    loadingSection.offsetHeight; // Force reflow
    resultsDiv.style.display = 'none';
    resultsDiv.innerHTML = '';

    progressBar.style.width = '100%';
    scanText.textContent = "Error occurred: Invalid address.";

    await new Promise(resolve => setTimeout(resolve, 1000));

    loadingSection.style.display = "none";
    resultsDiv.innerHTML = `
      <div class="ai-output"><pre>Error: ${validation.error}</pre></div>
      <div class="button-container">
        <button id="reset-btn" class="btn">Reset</button>
      </div>
    `;
    resultsDiv.style.display = 'block';
    resultsDiv.scrollTop = 0;
    resultsDiv.classList.add('fade-in');

    // Reset button handler for validation error
    document.getElementById('reset-btn').addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      resultsDiv.style.display = 'none';
      resultsDiv.innerHTML = '';
      loadingSection.classList.add('hidden');
      loadingSection.style.display = 'none'; // Ensure hidden
      progressBar.style.width = '0%';
      scanText.textContent = '';
    });

    return; // Stop further processing
  }

  // Reset UI state
  form.style.display = "none";
  loadingSection.classList.remove('hidden');
  loadingSection.style.display = 'block'; // Ensure visibility
  loadingSection.offsetHeight; // Force reflow
  resultsDiv.style.display = 'none';
  resultsDiv.innerHTML = '';

  let progress = 0;
  let phraseIndex = 0;
  let progressInterval;

  const updateProgress = () => {
    progress += Math.random() * 10;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + '%';
    if (progress % 20 < 5) {
      scanText.textContent = scanningPhrases[phraseIndex % scanningPhrases.length];
      phraseIndex++;
    }
  };

  progressInterval = setInterval(updateProgress, 500);

  try {
    const response = await fetch('https://alastor-n8n.onrender.com/webhook/Property_Analysis_AI_Workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_address: address,
        listing_url: loopnetUrl
      }),
      timeout: 30000 // Add a timeout to prevent hanging
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    // Ensure the response is fully processed before proceeding
    let resultText;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      resultText = JSON.stringify(jsonData, null, 2); // Pretty-print JSON
    } else {
      resultText = await response.text();
    }

    // Sanitize the result to prevent XSS and ensure proper display
    const sanitizedText = resultText
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """)
      .replace(/'/g, "'");

    // Complete the progress bar
    clearInterval(progressInterval);
    progressBar.style.width = '100%';
    scanText.textContent = "Analysis Complete ✅";

    // Wait for the progress bar to finish before showing results
    await new Promise(resolve => setTimeout(resolve, 1000));

    loadingSection.style.display = "none";
    resultsDiv.innerHTML = `
      <div class="ai-output"><pre>${sanitizedText}</pre></div>
      <div class="button-container">
        <button id="download-btn" class="btn">Download Results</button>
        <button id="reset-btn" class="btn">Reset</button>
      </div>
    `;
    resultsDiv.style.display = 'block';
    resultsDiv.scrollTop = 0;
    resultsDiv.classList.add('fade-in');

    // Download button handler
    document.getElementById('download-btn').addEventListener('click', () => {
      const blob = new Blob([resultText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property_analysis_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Reset button handler
    document.getElementById('reset-btn').addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      resultsDiv.style.display = 'none';
      resultsDiv.innerHTML = '';
      loadingSection.classList.add('hidden');
      loadingSection.style.display = 'none'; // Ensure hidden
      progressBar.style.width = '0%';
      scanText.textContent = '';
    });

  } catch (error) {
    clearInterval(progressInterval);
    progressBar.style.width = '100%';
    scanText.textContent = "Error occurred: Webhook request failed. Please try again.";

    await new Promise(resolve => setTimeout(resolve, 1000));

    loadingSection.style.display = "none";
    resultsDiv.innerHTML = `
      <div class="ai-output"><pre>Error: ${error.message}</pre></div>
      <div class="button-container">
        <button id="reset-btn" class="btn">Reset</button>
      </div>
    `;
    resultsDiv.style.display = 'block';
    resultsDiv.scrollTop = 0;
    resultsDiv.classList.add('fade-in');

    // Reset button handler for error case
    document.getElementById('reset-btn').addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      resultsDiv.style.display = 'none';
      resultsDiv.innerHTML = '';
      loadingSection.classList.add('hidden');
      loadingSection.style.display = 'none'; // Ensure hidden
      progressBar.style.width = '0%';
      scanText.textContent = '';
    });
  }
});
```
