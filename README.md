# chartjs-node-puppeteer

A node renderer for [Chart.js](http://www.chartjs.org) using [puppeteer](https://github.com/GoogleChrome/puppeteer).

## Usage

```js
const { CanvasRenderService } = require('chartjs-node-puppeteer');

const width = 400;
const height = 400;
// The config must be serializable via JSON.stringify
const configuration = {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
};
// This will run in the browser context, serialized via .toString()
const chartCallback = (ChartJS) => {

    ChartJS.defaults.global.responsive = true;
    ChartJS.defaults.global.maintainAspectRatio = false;
};
(async () => {
    const canvasRenderService = new CanvasRenderService();
    try    {
        canvasRenderService.on('console', consoleMessage => console.log(consoleMessage.text()));
        canvasRenderService.on('error', error => console.error(error));
        canvasRenderService.on('pageerror', pageerror => console.error(pageerror));
        await canvasRenderService.initialize(width, height, chartCallback, scripts);
        const image = await canvasRenderService.render(configuration);
        await canvasRenderService.dispose();
    } catch (error) {
        await canvasRenderService.dispose();
        throw error;
    }
})();
```