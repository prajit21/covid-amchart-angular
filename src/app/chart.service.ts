import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, startWith, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  public Chart;
  public countries = ['India', 'Nepal', 'Bangladesh', 'Pakistan', 'Bhutan', 'Sri Lanka', 'Maldives'];

  constructor(private http: HttpClient) { }

  // Chart
  private get chart(): Observable<any[]> {
    return this.Chart = this.http.get<any[]>('https://corona.lmao.ninja/v2/countries/'+this.countries.join()).pipe(map(data => data));
  }

  // Get Chart
  public get getChart(): Observable<any[]> {
    return this.chart;
  }

}
