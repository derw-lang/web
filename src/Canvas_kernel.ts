import { RectConfig } from "./Canvas";
export function drawRect(canvas: HTMLCanvasElement, config: RectConfig): void {
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.fillStyle = config.color;
        ctx.fillRect(config.x, config.y, config.width, config.height);
    }
}
