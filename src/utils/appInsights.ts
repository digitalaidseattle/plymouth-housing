/**
 * @copyright 2026 Digital Aid Seattle
 */
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsights: ApplicationInsights | null = null;

export const initializeAppInsights = (): void => {
  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;
  const isDevelopment = import.meta.env.MODE === 'development';

  if (isDevelopment || !connectionString) {
    console.log(
      '[AppInsights] Skipping initialization:',
      isDevelopment ? 'development mode' : 'no connection string',
    );
    return;
  }

  try {
    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        enableAutoRouteTracking: false,
        disableFetchTracking: false,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: false,
        enableResponseHeaderTracking: false,
      },
    });

    appInsights.loadAppInsights();
    console.log('[AppInsights] Initialized successfully');
  } catch (error) {
    console.error('[AppInsights] Failed to initialize:', error);
  }
};

export const trackException = (
  error: Error,
  properties?: Record<string, string>,
): void => {
  if (appInsights) {
    appInsights.trackException({
      exception: error,
      properties: properties,
    });
  } else {
    console.error('[AppInsights] Exception:', error, properties);
  }
};

export const trackEvent = (
  name: string,
  properties?: Record<string, string | number | boolean>,
): void => {
  if (appInsights) {
    const stringProperties = properties
      ? Object.entries(properties).reduce(
          (acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          },
          {} as Record<string, string>,
        )
      : undefined;

    appInsights.trackEvent({
      name: name,
      properties: stringProperties,
    });
  } else {
    console.log('[AppInsights] Event:', name, properties);
  }
};

export const getAppInsights = (): ApplicationInsights | null => {
  return appInsights;
};
