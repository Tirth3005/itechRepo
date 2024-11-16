import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';

import CHARTJS from '@salesforce/resourceUrl/ChartJS'; // Replace with the correct resource URL

export default class LineChartWithGradientBackground extends LightningElement {
  @track isChartJsInitialized = false;

  chart;

  chartConfig = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Sales Data',
          data: [50, 70, 40, 60, 80],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'transparent', // Set the background to transparent
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        filler: {
          propagate: false,
        },
      },
    },
    plugins: {
      filler: {
        propagate: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    plugins: {
      title: {
        display: false,
      },
    },
  };

  get chartGradient() {
    const ctx = this.template.querySelector('canvas').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400); // Adjust the coordinates as needed
    gradient.addColorStop(0, 'rgba(75, 192, 192, 0.2)');
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0.0)'); // Set the alpha to 0 for transparency

    return gradient;
  }

  renderedCallback() {
    if (this.isChartJsInitialized) {
      return;
    }
    this.isChartJsInitialized = true;

    loadScript(this, CHARTJS)
      .then(() => {
        const ctx = this.template.querySelector('canvas').getContext('2d');
        this.chart = new window.Chart(ctx, this.chartConfig);

        const dataset = this.chart.data.datasets[0];
        dataset.pointBackgroundColor = this.chartGradient;
        dataset.pointBorderColor = this.chartGradient;
        this.chart.update();
      })
      .catch(error => {
        console.log('Error loading Chart.js', error);
      });
  }
}