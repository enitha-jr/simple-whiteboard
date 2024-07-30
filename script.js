const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let drawing = false;
let erasing = false;
let highlighting = false;
let currentColor = '#000000';
let slides = [];
let currentSlideIndex = 0;

// Initialize canvas
function initializeCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (slides[currentSlideIndex]) {
        ctx.drawImage(slides[currentSlideIndex], 0, 0);
    }
}

// Save current slide
function saveCurrentSlide() {
    const slide = document.createElement('canvas');
    slide.width = canvas.width;
    slide.height = canvas.height;
    slide.getContext('2d').drawImage(canvas, 0, 0);
    slides[currentSlideIndex] = slide;
    updateSlidePreview();
}

// Update slide preview
function updateSlidePreview() {
    const slidePreview = document.getElementById('slide-preview');
    slidePreview.innerHTML = '';
    slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('slide');
        
        const slideNumber = document.createElement('div');
        slideNumber.classList.add('slide-number');
        slideNumber.textContent = `Slide ${index + 1}`;
        
        const slideCanvas = document.createElement('canvas');
        slideCanvas.width = 100;
        slideCanvas.height = 75;
        slideCanvas.getContext('2d').drawImage(slide, 0, 0, 100, 75);
        
        slideCanvas.addEventListener('click', () => {
            saveCurrentSlide();
            currentSlideIndex = index;
            initializeCanvas();
            highlightActiveSlide();
        });
        
        slideDiv.appendChild(slideNumber);
        slideDiv.appendChild(slideCanvas);
        slidePreview.appendChild(slideDiv);
    });
    highlightActiveSlide();
}

// Highlight active slide
function highlightActiveSlide() {
    const slidesElements = document.querySelectorAll('.slide-preview .slide');
    slidesElements.forEach((slideElement, index) => {
        if (index === currentSlideIndex) {
            slideElement.classList.add('active');
        } else {
            slideElement.classList.remove('active');
        }
    });
}

// Tool selection functions
function setActiveTool(toolId) {
    const tools = document.querySelectorAll('.tool, #color-picker, #upload-slide');
    tools.forEach(tool => tool.classList.remove('active'));
    document.getElementById(toolId).classList.add('active');
}

// Event listeners for tool selection
document.getElementById('pen').addEventListener('click', () => {
    erasing = false;
    highlighting = false;
    setActiveTool('pen');
    document.body.classList.remove('cursor-eraser', 'cursor-highlighter');
    document.body.classList.add('cursor-pen');
});

document.getElementById('eraser').addEventListener('click', () => {
    erasing = true;
    highlighting = false;
    setActiveTool('eraser');
    document.body.classList.remove('cursor-pen', 'cursor-highlighter');
    document.body.classList.add('cursor-eraser');
});

document.getElementById('highlighter').addEventListener('click', () => {
    erasing = false;
    highlighting = true;
    setActiveTool('highlighter');
    document.body.classList.remove('cursor-pen', 'cursor-eraser');
    document.body.classList.add('cursor-highlighter');
});

document.getElementById('color-picker').addEventListener('input', (event) => {
    currentColor = event.target.value;
});

document.getElementById('add-slide').addEventListener('click', () => {
    saveCurrentSlide();
    slides.push(null);
    currentSlideIndex = slides.length - 1;
    initializeCanvas();
});

document.getElementById('upload-slide').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                saveCurrentSlide();
                slides[currentSlideIndex] = img;
                initializeCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

// Drawing functions
function startDrawing(event) {
    drawing = true;
    ctx.beginPath();
    draw(event);
}

function stopDrawing() {
    drawing = false;
    ctx.closePath();
}

function draw(event) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.lineWidth = erasing ? 20 : highlighting ? 30 : 2; // Increased highlighter width to 30
    ctx.lineCap = 'round';
    ctx.strokeStyle = erasing ? '#FFFFFF' : highlighting ? currentColor + '50' : currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

initializeCanvas();
updateSlidePreview();
