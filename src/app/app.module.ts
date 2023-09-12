import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { environment as env } from '../environments/environment';
import { IMqttServiceOptions, MqttModule } from 'ngx-mqtt';
import { RemoveCommaPipe } from './pipes/remove-comma.pipe';
import { BatteryComponent } from './components/battery/battery.component';
import { WeatherChartComponent } from './components/weather-chart/weather-chart.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { HttpClientModule } from '@angular/common/http';
import { WeatherGaugeComponent } from './components/weather-gauge/weather-gauge.component';
import { StatsComponent } from './components/stats/stats.component';
import { SelectLocationComponent } from './components/select-location/select-location.component';
import { HourlySummaryComponent } from './components/hourly-summary/hourly-summary.component';
import { OpenAPI } from './openapi';
import { DetailComponent } from './components/detail/detail.component';

const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: env.mqtt.server,
  port: env.mqtt.port,
  protocol: (env.mqtt.protocol === "wss") ? "wss" : "ws",
  path: '/mqtt',
  rejectUnauthorized:false
};

OpenAPI.BASE = '/api/weather';

@NgModule({
  declarations: [
    AppComponent,
    RemoveCommaPipe, 
    BatteryComponent, WeatherChartComponent, WeatherGaugeComponent, StatsComponent, SelectLocationComponent, HourlySummaryComponent, DetailComponent
  ],
  imports: [
    BrowserModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    GoogleChartsModule,
    HttpClientModule
  ],
  providers: [
    RemoveCommaPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
