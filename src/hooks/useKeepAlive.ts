import { useEffect } from 'react';
import { ClientPrincipal } from '../types/interfaces';
import { ENDPOINTS, API_HEADERS, SETTINGS, BUSINESS_HOURS } from '../types/constants';
import { getRole } from '../utils/userUtils';
import { responsiveFontSizes } from '@mui/material';

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

      // Get day and hour in the business timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: BUSINESS_HOURS.timezone,
        weekday: 'short',
        hour: 'numeric',
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const weekday = parts.find(p => p.type === 'weekday')?.value;
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);

      // Map weekday names to numbers (0 = Sunday)
      const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const day = weekday ? dayMap[weekday] : -1;

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
        const response = await fetch(ENDPOINTS.BUILDINGS, {
          method: 'GET',
          headers: headers,
        });
        if (response.status !== 200) {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
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
