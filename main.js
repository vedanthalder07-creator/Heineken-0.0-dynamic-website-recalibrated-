const canvas = document.getElementById('scroll-canvas');
const context = canvas ? canvas.getContext('2d') : null;
const frameCount = 227; // 235 total frames minus the last 8 frames per user request

const getFrameUrl = (index) => `./public/frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

const images = [];
let loadedImages = 0;
let targetFrame = 0;
let currentFrameIndex = 0;
const lerpFactor = 0.1;

// Preload images
function preloadImages() {
    if (!canvas || !context) return;
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
            loadedImages++;
            if (loadedImages === 1) {
                // Draw first frame immediately once loaded
                resizeCanvas();
                drawImage(images[0]);
                requestAnimationFrame(updateAnimationLoop);
            }
        };
        images.push(img);
    }
}

// Draw the image filling the screen
function drawImage(img) {
    if (!canvas || !context || !img || !img.complete) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;
    
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    // Zoom factor increased significantly to crop out the bottom corner ezgif/watermark logo
    const zoom = 1.15; 
    
    if (imgRatio > canvasRatio) {
        drawHeight = canvasHeight * zoom;
        drawWidth = canvasHeight * imgRatio * zoom;
    } else {
        drawWidth = canvasWidth * zoom;
        drawHeight = (canvasWidth / imgRatio) * zoom;
    }
    
    drawX = (canvasWidth - drawWidth) / 2;
    // Shift the image slightly down to aggressively crop the bottom watermark
    drawY = (canvasHeight - drawHeight) / 2 + (drawHeight * 0.05);
    
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Resize canvas
function resizeCanvas() {
    if (!canvas || !context) return;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    
    // Ensure high-quality rendering
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    
    const index = Math.min(frameCount - 1, Math.max(0, Math.round(currentFrameIndex)));
    if (images[index]) {
        drawImage(images[index]);
    }
}

// Animation loop for smooth interpolation
function updateAnimationLoop() {
    if (!canvas || !context) return;
    const diff = targetFrame - currentFrameIndex;
    
    if (Math.abs(diff) > 0.005) {
        currentFrameIndex += diff * lerpFactor;
        const index = Math.min(frameCount - 1, Math.max(0, Math.round(currentFrameIndex)));
        if (images[index]) {
            drawImage(images[index]);
        }
    }
    
    requestAnimationFrame(updateAnimationLoop);
}

// Sync scroll to frame relative to animation section
function handleScroll() {
    const section = document.getElementById('scroll-animation-section');
    if (!section) return;
    
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const scrollableDistance = sectionHeight - window.innerHeight;
    
    let scrollFraction = 0;
    if (window.scrollY >= sectionTop) {
        scrollFraction = (window.scrollY - sectionTop) / scrollableDistance;
    }
    
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));
    targetFrame = scrollFraction * (frameCount - 1);
    
    // Fade out heading overlay by 30% scroll
    const overlay = document.getElementById('scroll-overlay-text');
    if (overlay) {
        let opacity = 1 - (scrollFraction / 0.3);
        overlay.style.opacity = Math.max(0, Math.min(1, opacity));
    }
    
    // Composition overlay (appears 30% to 60%)
    const compOverlay = document.getElementById('scroll-overlay-composition');
    if (compOverlay) {
        let compOpacity = 0;
        if (scrollFraction > 0.3 && scrollFraction < 0.6) {
            // Fade in between 0.3 and 0.35
            if (scrollFraction <= 0.35) {
                compOpacity = (scrollFraction - 0.3) / 0.05;
            } 
            // Stay fully visible between 0.35 and 0.55
            else if (scrollFraction <= 0.55) {
                compOpacity = 1;
            } 
            // Fade out between 0.55 and 0.6
            else {
                compOpacity = 1 - ((scrollFraction - 0.55) / 0.05);
            }
        }
        compOverlay.style.opacity = Math.max(0, Math.min(1, compOpacity));
    }
    
    // Brand info overlay (appears 60% to 90%)
    const brandOverlay = document.getElementById('scroll-overlay-brand');
    if (brandOverlay) {
        let brandOpacity = 0;
        if (scrollFraction > 0.6 && scrollFraction < 0.9) {
            // Fade in between 0.6 and 0.65
            if (scrollFraction <= 0.65) {
                brandOpacity = (scrollFraction - 0.6) / 0.05;
            } 
            // Stay fully visible between 0.65 and 0.85
            else if (scrollFraction <= 0.85) {
                brandOpacity = 1;
            } 
            // Fade out between 0.85 and 0.9
            else {
                brandOpacity = 1 - ((scrollFraction - 0.85) / 0.05);
            }
        }
        brandOverlay.style.opacity = Math.max(0, Math.min(1, brandOpacity));
    }
    
    // Toggle scroll-to-top button visibility
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        if (window.scrollY > window.innerHeight) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.pointerEvents = 'auto';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.pointerEvents = 'none';
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (canvas && context) {
        preloadImages();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', resizeCanvas, { passive: true });
    }

    // 6. Store locator map search
    const searchForm = document.getElementById('store-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('store-search-input');
            const mapIframe = document.getElementById('store-map-iframe');
            
            if (input && input.value.trim() !== '' && mapIframe) {
                // Update the iframe source to search for wine stores near the provided zip code / area
                const query = `wine stores near ${input.value.trim()}`;
                mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
            }
        });
    }

    // 7. Mobile Drawer Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const closeDrawerBtn = document.getElementById('close-drawer-button');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

    if (mobileMenuBtn && closeDrawerBtn && mobileDrawer) {
        const toggleDrawer = (open) => {
            if (open) {
                mobileDrawer.classList.remove('translate-x-full');
                mobileDrawer.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            } else {
                mobileDrawer.classList.add('translate-x-full');
                mobileDrawer.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        };

        mobileMenuBtn.addEventListener('click', () => toggleDrawer(true));
        closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
        mobileDrawer.addEventListener('click', (e) => {
            if (e.target === mobileDrawer) {
                toggleDrawer(false);
            }
        });
        drawerLinks.forEach(link => {
            link.addEventListener('click', () => toggleDrawer(false));
        });
    }
});
