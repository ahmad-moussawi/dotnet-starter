import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { LocalGridController } from '../../grid/grid/LocalGridController';

@Component({
    selector: 'fetchdata',
    templateUrl: './fetchdata.component.html'
})
export class FetchDataComponent {
    public forecasts: WeatherForecast[];

    gridCtrl = new LocalGridController();
    menuContext = {};
    columns = [
        {name: 'dateFormatted as Date', datatype: 'date' },
        {name: 'temperatureC'},
        {name: 'temperatureF'},
        {name: 'summary'},
    ]

    constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
        http.get(baseUrl + 'api/SampleData/WeatherForecasts').subscribe(result => {
            this.forecasts = result.json() as WeatherForecast[];
            console.log(this.forecasts);
            this.gridCtrl.setData(this.forecasts).render();
        }, error => console.error(error));
    }
}

interface WeatherForecast {
    dateFormatted: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}
