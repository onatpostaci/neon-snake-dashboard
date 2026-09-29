import { createApp } from './app.js';
import { config } from './config/env.js';

createApp().listen(config.port, '127.0.0.1', () => {
  console.log(`API listening on http://127.0.0.1:${config.port}`);
});
