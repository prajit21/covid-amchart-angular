import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartService } from "./chart.service";

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4plugins_sunburst from "@amcharts/amcharts4/plugins/sunburst"; 
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  private chart: am4charts.XYChart;
  public chartData = [];

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone,
  private chartService: ChartService) {

    this.chartService.getChart.subscribe(res => {
        if(res.length){
          res.forEach(data => {
            this.chartData.push({
              name: data.country,
              children: [
                { 
                  name: "Total Cases",
                  children: [
                    { name: "Recovered", value: data.recovered },
                    { name: "Deaths", value: data.deaths },
                    { name: "Active", value: data.active },
                  ]
                }
              ]
            })
          })
        }
    })
    
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngAfterViewChecked() {
    // Chart code goes in here
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      let chart = am4core.create("chartdiv", am4plugins_sunburst.Sunburst);
      chart.padding(0,0,0,0);
      chart.radius = am4core.percent(98);

      // Add multi-level data
      chart.data = this.chartData;
      
      // Define data fields
      chart.dataFields.value = "value";
      chart.dataFields.name = "name";
      chart.dataFields.children = "children";
      
      let level0SeriesTemplate = new am4plugins_sunburst.SunburstSeries();
      level0SeriesTemplate.hiddenInLegend = false;
      chart.seriesTemplates.setKey("0", level0SeriesTemplate)

      // this makes labels to be hidden if they don't fit
      level0SeriesTemplate.labels.template.truncate = true;
      level0SeriesTemplate.labels.template.hideOversized = true;

      level0SeriesTemplate.labels.template.adapter.add("rotation", function(rotation, target) {
        target.maxWidth = target.dataItem.slice.radius - target.dataItem.slice.innerRadius - 10;
        target.maxHeight = Math.abs(target.dataItem.slice.arc * (target.dataItem.slice.innerRadius + target.dataItem.slice.radius) / 2 * am4core.math.RADIANS);
        return rotation;
      })

      let level1SeriesTemplate = level0SeriesTemplate.clone();
      chart.seriesTemplates.setKey("1", level1SeriesTemplate)
      level1SeriesTemplate.fillOpacity = 0.75;
      level1SeriesTemplate.hiddenInLegend = true;

      let level2SeriesTemplate = level0SeriesTemplate.clone();
      chart.seriesTemplates.setKey("2", level2SeriesTemplate)
      level2SeriesTemplate.fillOpacity = 0.5;
      level2SeriesTemplate.hiddenInLegend = true;

      chart.legend = new am4charts.Legend();
      chart.legend.position = "right";
      chart.legend.labels.template.maxWidth = 120;
      chart.legend.labels.template.truncate = true;
      chart.legend.labels.template.wrap = true;
      chart.legend.itemContainers.template.tooltipText = "{category}";

    });
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
  
}
