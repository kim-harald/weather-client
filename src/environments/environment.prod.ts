export const environment = {
  production: true,
  hmr: false,
  mqtt: {
    server: 'kimharald.no',
    protocol: 'wss',
    port: 8083,
  },
};

import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
