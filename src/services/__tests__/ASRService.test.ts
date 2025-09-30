/**
 * ASR Service Unit Tests
 */

import { asrService } from '../ASRService';

describe('ASRService', () => {
  it('should check if ASR is supported', () => {
    const isSupported = asrService.isSupported();
    expect(typeof isSupported).toBe('boolean');
  });

  it('should initialize with language', async () => {
    await expect(asrService.init('en')).resolves.not.toThrow();
    await expect(asrService.init('hi')).resolves.not.toThrow();
  });

  it('should handle unsupported environment gracefully', async () => {
    if (!asrService.isSupported()) {
      await expect(asrService.startListening()).rejects.toThrow(
        'Speech recognition not supported'
      );
    }
  });
});
