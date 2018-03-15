"use strict";
//https://intoli.com/blog/saving-images/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = require("path");
const events_1 = require("events");
/**
 * Reusable service to render chart.js charts to png.
 *
 * @export
 * @class CanvasRenderService
 * @extends {EventEmitter}
 */
class CanvasRenderService extends events_1.EventEmitter {
    constructor() {
        super();
        this._chartId = 'chart';
        this._browser = null;
        this._page = null;
        this._canvasHandle = null;
    }
    /**
     * Initialize the render service. This creates background resources that need to be disposed.
     *
     * @param {number} width The width of the canvas to draw charts.
     * @param {number} height The height of the canvas to draw charts.
     * @param {ChartCallback} [chartCallback] Optional callback that recieves the global Chart reference. This is executed in the browser sandbox context.
     * @param {Iterable<string>} [scripts] Optional scripts to add to the sandbox.
     * @returns {Promise<void>}
     * @memberof CanvasRenderService
     */
    async initialize(width, height, chartCallback, scripts) {
        this._browser = await puppeteer_1.default.launch();
        this._page = await this._browser.newPage();
        this._page.on('console', consoleMessage => this.emit('console', consoleMessage));
        this._page.on('error', error => {
            if (this.listenerCount('error') > 0) {
                this.emit('error', error);
            }
            else {
                throw error;
            }
        });
        this._page.on('pageerror', pageerror => {
            if (this.listenerCount('pageerror') > 0) {
                this.emit('pageerror', pageerror);
            }
            else {
                throw new Error(pageerror);
            }
        });
        await this._page.setContent(`<!DOCTYPE html>
			<html>
				<body>
					<canvas id="${this._chartId}" width="${width}" height="${height}"></canvas>
				</body>
			</html>`);
        await this._page.addScriptTag({
            path: path_1.resolve(__dirname, '../node_modules/chart.js/dist/Chart.bundle.min.js')
        });
        if (scripts) {
            for (const script of scripts) {
                await this._page.addScriptTag({ content: script });
            }
        }
        if (chartCallback) {
            const chartHandle = await this._page.evaluateHandle(() => Chart);
            await this._page.evaluate(chartCallback, chartHandle);
            await chartHandle.dispose();
        }
        this._canvasHandle = await this._page.$(`#${this._chartId}`);
    }
    /**
     * Release the puppeteer resouces created in the initialize method.
     *
     * @returns {Promise<void>}
     * @memberof CanvasRenderService
     */
    async dispose() {
        if (this._canvasHandle) {
            await this._canvasHandle.dispose();
        }
        if (this._page) {
            await this._page.close();
        }
        if (this._browser) {
            await this._browser.close();
        }
    }
    /**
     * Render a chart to png, this can be reused with different chart configs.
     *
     * @param {Chart.ChartConfiguration} configuration The chart.js config.
     * @returns {Promise<Buffer>} A buffer containing the png image.
     * @memberof CanvasRenderService
     */
    async render(configuration) {
        if (!this._browser || !this._page || !this._canvasHandle) {
            throw new Error('not created');
        }
        const blob = await this._page.evaluate((canvas, config) => {
            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, config);
            // return new Promise((resolve, reject) => {
            // 	chart.canvas.toBlob((blob) => {
            // 		return resolve(blob);
            // 	}, 'image/png');
            // });
        }, this._canvasHandle, configuration);
        const image = await this._canvasHandle.screenshot({
            omitBackground: true
        });
        return image;
    }
}
exports.CanvasRenderService = CanvasRenderService;
//# sourceMappingURL=index.js.map