import * as THREE from 'https://cdn.skypack.dev/three@0.139.1/build/three.module';

// 1. Typewriter Effect
const text = "Crazy na 1 month na since nung nagkita tayo online, anyways";
let i = 0;
function typeWriter() {
    if (i < text.length) {
        document.getElementById("typewriter").innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 80);
    }
}
window.onload = () => { setTimeout(typeWriter, 300); };

// 2. Scroll Reveal Logic
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.2 }); 
sections.forEach(sec => observer.observe(sec));


// 3. Interactive Three.js Drawing (Stage 2)
const canvasEl = document.querySelector('#drawingCanvas');
const s2 = document.querySelector('#s2');

const pointer = { x: .5, y: .6, moved: false, speed: 0 };
window.setTimeout(() => { pointer.x = .7; pointer.y = .5; pointer.moved = true; }, 100);

let renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let sceneShader = new THREE.Scene();
let sceneBasic = new THREE.Scene();
let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
let clock = new THREE.Clock();

let renderTargets = [
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
];

let basicMaterial, shaderMaterial;

function createPlane() {
    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_stop_time: {type: "f", value: 0.},
            u_point: {type: "v2", value: new THREE.Vector2(pointer.x, pointer.y)},
            u_moving: {type: "f", value: 0.},
            u_speed: {type: "f", value: 0.},
            u_stop_randomizer: {type: "v2", value: new THREE.Vector2(Math.random(), Math.random())},
            u_clean: {type: "f", value: 1.},
            u_ratio: {type: "f", value: window.innerWidth / window.innerHeight},
            u_flower_scale: {type: "f", value: Math.min(2.4, Math.max(1, 1440 / window.innerWidth))},
            u_texture: {type: "t", value: null}
        },
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: document.getElementById("fragmentShader").textContent
    });
    basicMaterial = new THREE.MeshBasicMaterial();
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    sceneBasic.add(new THREE.Mesh(planeGeometry, basicMaterial));
    sceneShader.add(new THREE.Mesh(planeGeometry, shaderMaterial));
}

function updateSize() {
    const w = s2.clientWidth;
    const h = s2.clientHeight;
    shaderMaterial.uniforms.u_ratio.value = w / h;
    shaderMaterial.uniforms.u_flower_scale.value = Math.min(2.4, Math.max(1, 1440 / w));
    renderer.setSize(w, h);
    renderTargets[0].setSize(w, h);
    renderTargets[1].setSize(w, h);
}

createPlane();
updateSize();
window.addEventListener("resize", updateSize);

function render() {
    shaderMaterial.uniforms.u_clean.value = 1;
    shaderMaterial.uniforms.u_point.value = new THREE.Vector2(pointer.x, 1 - pointer.y);
    shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture;
    
    if (pointer.moved) {
        shaderMaterial.uniforms.u_moving.value = 1.;
        shaderMaterial.uniforms.u_stop_randomizer.value = new THREE.Vector2(Math.random(), Math.random());
        shaderMaterial.uniforms.u_stop_time.value = 0.;
        pointer.moved = false;
    } else {
        shaderMaterial.uniforms.u_moving.value = 0.;
    }
    
    shaderMaterial.uniforms.u_stop_time.value += clock.getDelta();
    shaderMaterial.uniforms.u_speed.value = pointer.speed;

    renderer.setRenderTarget(renderTargets[1]);
    renderer.render(sceneShader, camera);
    basicMaterial.map = renderTargets[1].texture;
    renderer.setRenderTarget(null);
    renderer.render(sceneBasic, camera);

    let tmp = renderTargets[0];
    renderTargets[0] = renderTargets[1];
    renderTargets[1] = tmp;

    requestAnimationFrame(render);
}
render();

function updatePointer(clientX, clientY) {
    const rect = canvasEl.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    
    const dx = 12 * (nx - pointer.x);
    const dy = 12 * (ny - pointer.y);
    pointer.speed = Math.min(2, Math.pow(dx, 2) + Math.pow(dy, 2));
    
    pointer.x = nx;
    pointer.y = ny;
    pointer.moved = true;
}

let isDrawing = false;
canvasEl.addEventListener("mousedown", (e) => { isDrawing = true; updatePointer(e.clientX, e.clientY); });
canvasEl.addEventListener("mousemove", (e) => { if(isDrawing) updatePointer(e.clientX, e.clientY); });
window.addEventListener("mouseup", () => { isDrawing = false; pointer.speed = 0; });

canvasEl.addEventListener("touchstart", (e) => {
    isDrawing = true; 
    updatePointer(e.targetTouches[0].clientX, e.targetTouches[0].clientY); 
}, {passive: true});

canvasEl.addEventListener("touchmove", (e) => {
    if(!isDrawing) return;
    updatePointer(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
}, {passive: true});

canvasEl.addEventListener("touchend", () => { isDrawing = false; pointer.speed = 0; });


// 4. The Ask & Success Logic
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const s4 = document.getElementById('s4');
const successScreen = document.getElementById('successScreen');
const successSpotifyContainer = document.getElementById('successSpotifyContainer');

const noTexts = [
    "Wag naman 😭", "Sure ka na ba? 🥺", "Wait lang isipin mo muna 😭", 
    "Grabe siya 💔", "Sakit naman 🥺", "Sige na press Yes na 😭",
    "Ahh ganon 😭", "Luhh 😭",
];
let clickCount = 0;

noBtn.addEventListener('click', (e) => {
    noBtn.innerText = noTexts[Math.min(clickCount, noTexts.length - 1)]; 
    clickCount++;

    const currentFontSize = window.getComputedStyle(yesBtn).getPropertyValue('font-size');
    const newSize = parseFloat(currentFontSize) * 1.3; 
    yesBtn.style.fontSize = `${newSize}px`;
    yesBtn.style.padding = `${newSize * 0.8}px ${newSize * 1.2}px`;
    yesBtn.style.width = 'auto'; yesBtn.style.maxWidth = '90vw'; 
});

let noIsFloating = false;
function moveNoButton() {
    if (!noIsFloating) {
        noBtn.classList.add('floating');
        noBtn.style.left = noBtn.getBoundingClientRect().left + 'px';
        noBtn.style.top = noBtn.getBoundingClientRect().top + 'px';
        noIsFloating = true;
    }
    const margin = 40;
    noBtn.style.left = Math.max(margin, Math.random() * (window.innerWidth - noBtn.offsetWidth - margin)) + 'px';
    noBtn.style.top = Math.max(margin, Math.random() * (window.innerHeight - noBtn.offsetHeight - margin)) + 'px';
}
noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); }, {passive: false});

// Yes Button Click!
yesBtn.addEventListener('click', () => {
    s4.style.display = 'none';
    successScreen.style.display = 'flex';
    setTimeout(() => { successScreen.classList.add('visible'); }, 50);

    // Inject your Bruno Mars "Just The Way You Are" iframe cleanly into the success card
    successSpotifyContainer.innerHTML = `<iframe data-testid="embed-iframe" style="border-radius:12px; margin-top: 15px;" src="https://open.spotify.com/embed/track/7BqBn9nzAq8spo5e7cZ0dJ?utm_source=generator&si=d9f86f5579054afe" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;

    // Unpause flower CSS animation
    document.body.classList.remove('not-loaded');
    
    // Auto scroll to success screen
    window.scrollTo({ top: successScreen.offsetTop, behavior: 'smooth' });
});