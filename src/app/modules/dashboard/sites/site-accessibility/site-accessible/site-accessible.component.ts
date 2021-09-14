import { Component, Input, OnInit } from '@angular/core';

import * as moment from 'moment';

@Component({
  selector: 'cb-site-accessible',
  templateUrl: './site-accessible.component.html',
  styleUrls: ['./site-accessible.component.scss']
})
export class SiteAccessibleComponent implements OnInit {

  to = moment().format('YYYY-MM-DD');

  @Input() for: any;
  @Input() from: string;
  @Input() yearlyData: any;

  data = [];
  options: any = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' %';
            }
            return label;
          }
        }
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          borderColor: 'rgba(0,0,0,0)'
        },
        ticks: {
          color: '#a3a3a3',
          font: {
            size: 12,
            family: 'Roboto',
            weight: 400
          },
          maxRotation: 0,
          minRotation: 0
        }
      },
      y: {
        grid: {
          color: "#474747",
          borderColor: 'rgba(0,0,0,0)',
          borderDash: [1, 1]
        },
        ticks: {
          color: '#a3a3a3',
          font: {
            size: 12,
            family: 'Roboto',
            weight: 400
          },
          callback: (val) => {
            return val + ' %'
          }
        }
      }
    }
  };
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  initialized = false;

  constructor() { }

  ngOnInit(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    for (let i = 0; i < this.yearlyData.years.length; i++) {
      const year = this.yearlyData.years[i];
      const yearData = this.yearlyData[year.year];
      this.data.push({ data: yearData[this.for.key], label: year.year, borderColor: year.color, backgroundColor: year.color, borderWidth: 2 });
    }
  }

}
