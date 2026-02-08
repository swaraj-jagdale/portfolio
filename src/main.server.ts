import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app/app.config';
import { App } from './app/app';

export function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(
    App,
    {
      ...appConfig,
      providers: [provideServerRendering(), ...(appConfig.providers ?? [])]
    },
    context
  );
}

export default bootstrap;
