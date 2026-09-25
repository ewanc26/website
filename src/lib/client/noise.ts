const hash32 = (value: string) => {
    let hash = 5381;
    for (let i = 0; i < value.length; i++) hash = Math.imul(33, hash) ^ value.charCodeAt(i);
    return hash >>> 0;
};

const makePrng = (seed: number) => {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        return state / 0x100000000;
    };
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

function makeSampler(gridSize: number, rng: () => number) {
    const size = gridSize + 1;
    const grid = Array.from({ length: size * size }, () => rng());
    return (x: number, y: number) => {
        const fx = x * gridSize;
        const fy = y * gridSize;
        const gx = Math.floor(fx);
        const gy = Math.floor(fy);
        const tx = smoothstep(fx - gx);
        const ty = smoothstep(fy - gy);
        const at = (px: number, py: number) => grid[py * size + px];
        return (
            (1 - ty) * ((1 - tx) * at(gx, gy) + tx * at(gx + 1, gy)) +
            ty * ((1 - tx) * at(gx, gy + 1) + tx * at(gx + 1, gy + 1))
        );
    };
}

function renderNoise(canvas: HTMLCanvasElement, seed: string, width: number, height: number) {
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;

    const baseHue = hash32(seed) % 360;
    const samplers = Array.from({ length: 3 }, (_, octave) =>
        makeSampler(5 * Math.pow(2, octave), makePrng(hash32(`${seed}|oct${octave}`))),
    );
    const image = context.createImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const nx = x / width;
            const ny = y / height;
            let value = 0;
            let amplitude = 1;
            let maxAmplitude = 0;

            for (const sampler of samplers) {
                value += sampler(nx, ny) * amplitude;
                maxAmplitude += amplitude;
                amplitude *= 0.5;
            }

            value /= maxAmplitude;
            const hue = ((baseHue + value * 60) % 360) / 360;
            const saturation = (45 + value * 25) / 100;
            const lightness = (40 + value * 30) / 100;
            const a = saturation * Math.min(lightness, 1 - lightness);
            const f = (n: number) => {
                const k = (n + hue * 12) % 12;
                return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
            };
            const index = (y * width + x) * 4;
            image.data[index] = Math.round(f(0) * 255);
            image.data[index + 1] = Math.round(f(8) * 255);
            image.data[index + 2] = Math.round(f(4) * 255);
            image.data[index + 3] = 255;
        }
    }

    context.putImageData(image, 0, 0);
}

export function noiseAction(
    canvas: HTMLCanvasElement,
    params: { seed: string; width?: number; height?: number },
) {
    const render = (next: typeof params) =>
        renderNoise(canvas, next.seed, next.width ?? 1200, next.height ?? 630);
    render(params);
    return { update: render };
}
