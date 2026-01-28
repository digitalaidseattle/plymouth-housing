/**
 * @copyright 2026 Digital Aid Seattle
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';

const mockLoadAppInsights = vi.fn();
const mockTrackException = vi.fn();

const MockApplicationInsights = vi.fn(function (this: unknown) {
  return {
    loadAppInsights: mockLoadAppInsights,
    trackException: mockTrackException,
  };
});

vi.mock('@microsoft/applicationinsights-web', () => ({
  ApplicationInsights: MockApplicationInsights,
}));

describe('appInsights', () => {
  let consoleLogSpy: Mock<typeof console.log>;
  let consoleErrorSpy: Mock<typeof console.error>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLoadAppInsights.mockClear();
    mockTrackException.mockClear();
    MockApplicationInsights.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('initializeAppInsights', () => {
    it('should skip initialization in development mode', async () => {
      vi.stubEnv('MODE', 'development');
      vi.stubEnv('VITE_APPINSIGHTS_CONNECTION_STRING', 'test-connection-string');

      const { initializeAppInsights } = await import('./appInsights');
      initializeAppInsights();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[AppInsights] Skipping initialization:',
        'development mode',
      );
      expect(MockApplicationInsights).not.toHaveBeenCalled();
    });

    it('should skip initialization when no connection string provided', async () => {
      vi.stubEnv('MODE', 'production');
      vi.stubEnv('VITE_APPINSIGHTS_CONNECTION_STRING', '');

      const { initializeAppInsights } = await import('./appInsights');
      initializeAppInsights();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[AppInsights] Skipping initialization:',
        'no connection string',
      );
      expect(MockApplicationInsights).not.toHaveBeenCalled();
    });

    it('should initialize App Insights in production with connection string', async () => {
      vi.stubEnv('MODE', 'production');
      vi.stubEnv(
        'VITE_APPINSIGHTS_CONNECTION_STRING',
        'InstrumentationKey=test-key',
      );

      const { initializeAppInsights } = await import('./appInsights');
      initializeAppInsights();

      expect(MockApplicationInsights).toHaveBeenCalledWith({
        config: expect.objectContaining({
          connectionString: 'InstrumentationKey=test-key',
          enableAutoRouteTracking: false,
          disableFetchTracking: false,
          enableCorsCorrelation: true,
        }),
      });
      expect(mockLoadAppInsights).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[AppInsights] Initialized successfully',
      );
    });

    it('should handle initialization errors gracefully', async () => {
      vi.stubEnv('MODE', 'production');
      vi.stubEnv(
        'VITE_APPINSIGHTS_CONNECTION_STRING',
        'InstrumentationKey=test-key',
      );

      const testError = new Error('Initialization failed');
      mockLoadAppInsights.mockImplementationOnce(() => {
        throw testError;
      });

      const { initializeAppInsights } = await import('./appInsights');
      initializeAppInsights();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AppInsights] Failed to initialize:',
        testError,
      );
    });
  });

  describe('trackException', () => {
    it('should track exception when App Insights is initialized', async () => {
      vi.stubEnv('MODE', 'production');
      vi.stubEnv(
        'VITE_APPINSIGHTS_CONNECTION_STRING',
        'InstrumentationKey=test-key',
      );

      const { initializeAppInsights, trackException } = await import(
        './appInsights'
      );
      initializeAppInsights();

      const testError = new Error('Test error');
      const properties = { component: 'TestComponent', action: 'testAction' };

      trackException(testError, properties);

      expect(mockTrackException).toHaveBeenCalledWith({
        exception: testError,
        properties: properties,
      });
    });

    it('should fallback to console.error when App Insights not initialized', async () => {
      vi.stubEnv('MODE', 'development');
      vi.stubEnv('VITE_APPINSIGHTS_CONNECTION_STRING', '');

      const { initializeAppInsights, trackException } = await import(
        './appInsights'
      );
      initializeAppInsights();

      const testError = new Error('Test error');
      const properties = { component: 'TestComponent' };

      trackException(testError, properties);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AppInsights] Exception:',
        testError,
        properties,
      );
      expect(mockTrackException).not.toHaveBeenCalled();
    });

    it('should track exception without properties', async () => {
      vi.stubEnv('MODE', 'production');
      vi.stubEnv(
        'VITE_APPINSIGHTS_CONNECTION_STRING',
        'InstrumentationKey=test-key',
      );

      const { initializeAppInsights, trackException } = await import(
        './appInsights'
      );
      initializeAppInsights();

      const testError = new Error('Test error');
      trackException(testError);

      expect(mockTrackException).toHaveBeenCalledWith({
        exception: testError,
        properties: undefined,
      });
    });
  });

  describe('getAppInsights', () => {
    it('should return null when not initialized', async () => {
      vi.stubEnv('MODE', 'development');

      const { getAppInsights } = await import('./appInsights');

      expect(getAppInsights()).toBeNull();
    });

    it('should return App Insights instance when initialized', async () => {
      vi.stubEnv('MODE', 'production');
      vi.stubEnv(
        'VITE_APPINSIGHTS_CONNECTION_STRING',
        'InstrumentationKey=test-key',
      );

      const { initializeAppInsights, getAppInsights } = await import(
        './appInsights'
      );
      initializeAppInsights();

      const instance = getAppInsights();
      expect(instance).not.toBeNull();
      expect(instance).toHaveProperty('loadAppInsights');
      expect(instance).toHaveProperty('trackException');
    });
  });
});
