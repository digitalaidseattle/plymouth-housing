import { useEffect } from 'react';
import { ClientPrincipal } from '../types/interfaces';
import { ENDPOINTS, API_HEADERS, SETTINGS, BUSINESS_HOURS } from '../types/constants';
import { getRole } from '../utils/userUtils';

interface UseKeepAliveOptions {
  user: ClientPrincipal | null;
  enabled?: boolean;
}

/**
 * Hook to keep the backend (DAB + database) warm during business hours.
 * Pings the API periodically to prevent Azure Container Apps from spinning down.
 */
export const useKeepAlive = ({ user, enabled = true }: UseKeepAliveOptions) => {
  useEffect(() => {
    if (!enabled || !user) {
      return;
    }

    const isBusinessHours = (): boolean => {
      const now = new Date();
      const localTime = new Date(now.toLocaleString('en-US', { timeZone: BUSINESS_HOURS.timezone }));

      const day = localTime.getDay();
      const hour = localTime.getHours();

      const isBusinessDay = (BUSINESS_HOURS.days as readonly number[]).includes(day);
      const isDuringBusinessHours = hour >= BUSINESS_HOURS.openingHour && hour < BUSINESS_HOURS.closingHour;

      return isBusinessDay && isDuringBusinessHours;
    };

    const pingBackend = async () => {
      if (!isBusinessHours()) {
        return;
      }

      try {
        const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
        await fetch(ENDPOINTS.BUILDINGS, {
          method: 'GET',
          headers: headers,
        });
        console.log('[KeepAlive] Backend ping successful');
      } catch (error) {
        console.error('[KeepAlive] Backend ping failed:', error);
      }
    };

    // Ping immediately if we're in business hours
    pingBackend();

    // Set up interval to ping every N minutes
    const intervalId = setInterval(pingBackend, SETTINGS.keep_alive_interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, enabled]);
};
