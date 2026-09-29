import type { GameplayEvent } from './gameplayEvent';
import type { GameplayAnalyticsClient } from './GameplayAnalytics';

export class HttpGameplayAnalytics implements GameplayAnalyticsClient {
  constructor(private readonly endpoint = '/api/events') {}

  async record(event: GameplayEvent, options?: { keepalive?: boolean }): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: options?.keepalive ?? false
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        console.error('[analytics]', body?.error ?? `The server rejected the event (${response.status}).`);
      }
    } catch (error) {
      console.error('[analytics] The gameplay event could not be sent.', error);
    }
  }
}
