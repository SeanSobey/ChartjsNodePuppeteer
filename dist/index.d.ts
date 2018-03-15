/// <reference types="chart.js" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Chart as ChartJS } from 'chart.js';
export declare type ChartCallback = (chartJS: typeof ChartJS) => void | Promise<void>;
/**
 * Reusable service to render chart.js charts to png.
 *
 * @export
 * @class CanvasRenderService
 * @extends {EventEmitter}
 */
export declare class CanvasRenderService extends EventEmitter {
    private readonly _chartId;
    private _browser;
    private _page;
    private _canvasHandle;
    constructor();
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
    initialize(width: number, height: number, chartCallback?: ChartCallback, scripts?: Iterable<string>): Promise<void>;
    /**
     * Release the puppeteer resouces created in the initialize method.
     *
     * @returns {Promise<void>}
     * @memberof CanvasRenderService
     */
    dispose(): Promise<void>;
    /**
     * Render a chart to png, this can be reused with different chart configs.
     *
     * @param {Chart.ChartConfiguration} configuration The chart.js config.
     * @returns {Promise<Buffer>} A buffer containing the png image.
     * @memberof CanvasRenderService
     */
    render(configuration: Chart.ChartConfiguration): Promise<Buffer>;
}
