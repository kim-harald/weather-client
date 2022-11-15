import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { environment as env } from '../environments/environment';
import { IMqttServiceOptions, MqttModule } from 'ngx-mqtt';
import { RemoveCommaPipe } from './pipes/remove-comma.pipe';
import { BatteryComponent } from './components/battery/battery.component';
import { WeatherChartComponent } from './components/weather-chart/weather-chart.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { WeatherGaugeComponent } from './components/weather-gauge/weather-gauge.component';
import { StatsComponent } from './components/stats/stats.component';

const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: env.mqtt.server,
  port: env.mqtt.port,
  protocol: (env.mqtt.protocol === "wss") ? "wss" : "ws",
  path: '/mqtt',
  rejectUnauthorized:false
};

@NgModule({
  declarations: [
    AppComponent,
    RemoveCommaPipe, 
    BatteryComponent, WeatherChartComponent, WeatherGaugeComponent, StatsComponent
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
