<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  // Props with defaults
  export let opacity = 0.5;
  export let count = 5;
  export let timeEnabled = true;
  
  // State variables
  let shapes: Array<{
    id: number;
    type: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
    color: string;
    targetColor: string;
    speed: number;
    verticalDirection: number; // 1 for down, -1 for up, 0 for neutral
  }> = [];
  
  let mounted = false;
  let isDarkMode = true;
  let currentTheme = 'default';
  let hour = new Date().getHours();
  let minute = new Date().getMinutes();
  let animationFrame: number;
  let themeChangeListener: EventListener;
  
  // Time phase transition constants
  const MORNING_START = 5;
  const AFTERNOON_START = 12;
  const EVENING_START = 18;
  const NIGHT_START = 22;
  
  // Shape types
  const shapeTypes = ['circle', 'square', 'triangle', 'blob'];
  
  // Calculate blend factor for smooth transitions between time phases
  function getTimeBlendFactor() {
    if (!timeEnabled) return { phase: 'static', blendFactor: 0 };
    
    const currentTime = hour + (minute / 60);
    
    // Calculate how close we are to the next phase (0 = just started phase, 1 = about to change phase)
    if (currentTime >= MORNING_START && currentTime < AFTERNOON_START) {
      // Morning phase
      const progress = (currentTime - MORNING_START) / (AFTERNOON_START - MORNING_START);
      return { phase: 'morning', nextPhase: 'afternoon', blendFactor: progress };
    } else if (currentTime >= AFTERNOON_START && currentTime < EVENING_START) {
      // Afternoon phase
      const progress = (currentTime - AFTERNOON_START) / (EVENING_START - AFTERNOON_START);
      return { phase: 'afternoon', nextPhase: 'evening', blendFactor: progress };
    } else if (currentTime >= EVENING_START && currentTime < NIGHT_START) {
      // Evening phase
      const progress = (currentTime - EVENING_START) / (NIGHT_START - EVENING_START);
      return { phase: 'evening', nextPhase: 'night', blendFactor: progress };
    } else {
      // Night phase (including early morning)
      const nightDuration = (24 - NIGHT_START) + MORNING_START;
      let progress;
      if (currentTime >= NIGHT_START) {
        progress = (currentTime - NIGHT_START) / nightDuration;
      } else {
        progress = (currentTime + (24 - NIGHT_START)) / nightDuration;
      }
      return { phase: 'night', nextPhase: 'morning', blendFactor: progress };
    }
  }
  
  // Generate random shapes based on theme and time
  function generateShapes() {
    const newShapes = [];
    
    for (let i = 0; i < count; i++) {
      // Get theme-based colors from CSS variables
      const linkColor = getComputedStyle(document.documentElement).getPropertyValue('--link-color').trim();
      const buttonBg = getComputedStyle(document.documentElement).getPropertyValue('--button-bg').trim();
      const buttonHoverBg = getComputedStyle(document.documentElement).getPropertyValue('--button-hover-bg').trim();
      
      // Choose color based on index and time
      let color: string = '';
      let targetColor: string = '';
      let verticalDirection = 0;
      
      if (timeEnabled) {
        const { phase } = getTimeBlendFactor();
        
        // Set colors based on current phase
        if (phase === 'morning') {
          color = i % 3 === 0 ? buttonBg : linkColor;
          verticalDirection = -1; // rising
        } else if (phase === 'afternoon') {
          color = i % 3 === 0 ? linkColor : i % 3 === 1 ? buttonBg : buttonHoverBg;
          verticalDirection = 0; // neutral
        } else if (phase === 'evening' || phase === 'night') {
          color = i % 3 === 0 ? buttonHoverBg : buttonBg;
          verticalDirection = 1; // descending
        }
        
        // Target color will be the same as current color initially
        targetColor = color;
      } else {
        // Without time influence, just alternate colors
        color = i % 3 === 0 ? linkColor : i % 3 === 1 ? buttonBg : buttonHoverBg;
        targetColor = color;
        verticalDirection = 0;
      }
      
      // Create shape with random properties
      newShapes.push({
        id: i,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        x: Math.random() * 100, // percentage of container width
        y: Math.random() * 100, // percentage of container height
        size: 20 + Math.random() * 80, // size in pixels
        rotation: Math.random() * 360, // degrees
        color,
        targetColor,
        speed: 0.1 + Math.random() * 0.3, // rotation speed
        verticalDirection
      });
    }
    
    shapes = newShapes;
  }
  
  // Helper function to blend colors for transitions
  function blendColors(color1: string, color2: string, factor: number) {
    // Convert hex to RGB
    const parseColor = (color: string) => {
      if (color.startsWith('#')) {
        const hex = color.substring(1);
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16)
        };
      } else if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        if (matches && matches.length >= 3) {
          return {
            r: parseInt(matches[0]),
            g: parseInt(matches[1]),
            b: parseInt(matches[2])
          };
        }
      }
      // Default fallback
      return { r: 0, g: 0, b: 0 };
    };
    
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);
    
    // Blend the colors
    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
    
    // Convert back to hex or rgb format
    if (color1.startsWith('#') || color2.startsWith('#')) {
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } else {
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  
  // Animate shapes
  function animateShapes() {
    if (!mounted) return;
    
    // Get current time blend information
    const timeBlend = getTimeBlendFactor();
    
    // Get theme-based colors for transitions
    const linkColor = getComputedStyle(document.documentElement).getPropertyValue('--link-color').trim();
    const buttonBg = getComputedStyle(document.documentElement).getPropertyValue('--button-bg').trim();
    const buttonHoverBg = getComputedStyle(document.documentElement).getPropertyValue('--button-hover-bg').trim();
    
    shapes = shapes.map(shape => {
      // Update rotation based on speed
      const newRotation = (shape.rotation + shape.speed) % 360;
      
      // Position changes with smooth transitions
      let newX = shape.x;
      let newY = shape.y;
      let newVerticalDirection = shape.verticalDirection;
      let newTargetColor: string = shape.targetColor;
      
      if (timeEnabled) {
        // Update target color based on upcoming phase
        if (timeBlend.blendFactor > 0.8) { // Start preparing for next phase when 80% through current phase
          const i = shape.id % 3;
          
          if (timeBlend.nextPhase === 'morning') {
            newTargetColor = i === 0 ? buttonBg : linkColor;
            newVerticalDirection = -1; // rising
          } else if (timeBlend.nextPhase === 'afternoon') {
            newTargetColor = i === 0 ? linkColor : i === 1 ? buttonBg : buttonHoverBg;
            newVerticalDirection = 0; // neutral
          } else if (timeBlend.nextPhase === 'evening' || timeBlend.nextPhase === 'night') {
            newTargetColor = i === 0 ? buttonHoverBg : buttonBg;
            newVerticalDirection = 1; // descending
          }
        }
        
        // Apply vertical movement with smooth transition between phases
        const transitionFactor = Math.min(1, timeBlend.blendFactor * 1.25); // Accelerate transition slightly
        const effectiveDirection = shape.verticalDirection * (1 - transitionFactor) + newVerticalDirection * transitionFactor;
        
        // Apply the movement
        newY = shape.y + (0.002 * effectiveDirection);
        if (newY < -10) newY = 110;
        if (newY > 110) newY = -10;
        
        // Blend current color with target color for smooth transitions
        const blendedColor = blendColors(shape.color, newTargetColor, 0.01); // Gradual color change
        
        return {
          ...shape,
          rotation: newRotation,
          x: newX,
          y: newY,
          color: blendedColor,
          targetColor: newTargetColor,
          verticalDirection: newVerticalDirection
        };
      } else {
        // Without time influence
        return {
          ...shape,
          rotation: newRotation,
          x: newX,
          y: newY,
          color: shape.color,
          targetColor: shape.targetColor
        };
      }
    });
    
    animationFrame = requestAnimationFrame(animateShapes);
  }
  
  // Update time
  function updateTime() {
    if (timeEnabled) {
      hour = new Date().getHours();
      minute = new Date().getMinutes();
    }
  }
  
  // Handle theme changes
  function handleThemeChange(event: CustomEvent) {
    isDarkMode = event.detail.isDarkMode;
    currentTheme = event.detail.theme;
    generateShapes();
  }
  
  onMount(() => {
    mounted = true;
    
    // Check initial theme
    isDarkMode = document.documentElement.classList.contains('light') ? false : true;
    
    // Find current theme from classList
    document.documentElement.classList.forEach(className => {
      if (className !== 'light' && className !== 'dark') {
        currentTheme = className;
      }
    });
    
    if (!currentTheme) currentTheme = 'default';
    
    // Generate initial shapes
    generateShapes();
    
    // Start animation
    animationFrame = requestAnimationFrame(animateShapes);
    
    // Set up time update interval
    const timeInterval = setInterval(updateTime, 30000); // Check time every 30 seconds for smoother transitions
    
    // Listen for theme changes
    themeChangeListener = ((e: CustomEvent) => handleThemeChange(e)) as EventListener;
    document.addEventListener('themeChanged', themeChangeListener);
    
    return () => {
      mounted = false;
      cancelAnimationFrame(animationFrame);
      clearInterval(timeInterval);
      document.removeEventListener('themeChanged', themeChangeListener);
    };
  });
  
  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (themeChangeListener) {
      document.removeEventListener('themeChanged', themeChangeListener);
    }
  });
</script>

<div class="background-shapes" style="opacity: {opacity};">
  {#each shapes as shape (shape.id)}
    <div 
      class="shape {shape.type}"
      style="
        left: {shape.x}%;
        top: {shape.y}%;
        width: {shape.size}px;
        height: {shape.size}px;
        transform: rotate({shape.rotation}deg);
        background-color: {shape.color};
      "
    ></div>
  {/each}
</div>

<style>
  .background-shapes {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
  }
  
  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(8px);
    transition: transform 0.5s ease, background-color 1s ease;
  }
  
  .circle {
    border-radius: 50%;
  }
  
  .square {
    border-radius: 10%;
  }
  
  .triangle {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    border-radius: 0;
  }
  
  .blob {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
</style>