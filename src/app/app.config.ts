import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { IMqttServiceOptions, MqttServiceConfig, MqttClientService, MqttService } from 'ngx-mqtt';
import { GoogleChartsModule } from 'angular-google-charts';
import { environment as env } from '../environments/environment';
import { OpenAPI } from './openapi';
import { routes } from './app.routes';

const MQTT_OPTIONS: IMqttServiceOptions = {
  hostname: env.mqtt.server,
  port: env.mqtt.port,
  protocol: env.mqtt.protocol === 'wss' ? 'wss' : 'ws',
  path: '/mqtt',
  rejectUnauthorized: false,
};

OpenAPI.BASE = '/api/weather';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: MqttServiceConfig, useValue: MQTT_OPTIONS },
    { provide: MqttClientService, useValue: undefined },
    MqttService,
    importProvidersFrom(GoogleChartsModule),
  ]
};
