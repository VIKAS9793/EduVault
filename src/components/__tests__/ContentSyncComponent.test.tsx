/**
 * Production-Grade Content Sync Component Tests
 * MAANG Standards: Test behavior, not implementation
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  vi, describe, it, expect, beforeEach,
} from 'vitest';
import { ContentSyncComponent } from '../ContentSyncComponent';
import { contentManager } from '../../services/ContentManager';
import type { ContentSyncStatus } from '../../types';

// Mock dependencies
vi.mock('../../services/ContentManager', () => ({
  contentManager: {
    syncFromSource: vi.fn(),
  },
}));

vi.mock('../../hooks/useOfflineDetection', () => ({
  useOfflineDetection: () => [true, false], // isOnline, wasOffline
}));

describe('ContentSyncComponent', () => {
  const mockOnSyncComplete = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  describe('rendering', () => {
    it('should_render_sync_interface_correctly', () => {
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      expect(screen.getByText('Content Synchronization')).toBeInTheDocument();
      expect(screen.getByText('Sync real educational content from government sources')).toBeInTheDocument();
      expect(screen.getByText('Select Content Source')).toBeInTheDocument();
      expect(screen.getByText('NCERT Official')).toBeInTheDocument();
    });

    it('should_show_online_status', () => {
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);
      expect(screen.getByText('Online - Ready to sync')).toBeInTheDocument();
    });
  });

  describe('sync functionality', () => {
    it('should_sync_successfully', async () => {
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 10,
        syncedLessons: 10,
        failedSyncs: 0,
        pendingUpdates: 0,
      };

      vi.mocked(contentManager.syncFromSource).mockResolvedValue(mockSyncStatus);

      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      await waitFor(() => {
        expect(contentManager.syncFromSource).toHaveBeenCalledWith('NCERT');
        expect(mockOnSyncComplete).toHaveBeenCalledWith(mockSyncStatus);
      });

      expect(screen.getByText('NCERT Sync Complete')).toBeInTheDocument();
    });

    it('should_handle_sync_failures', async () => {
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 10,
        syncedLessons: 7,
        failedSyncs: 3,
        pendingUpdates: 0,
      };

      vi.mocked(contentManager.syncFromSource).mockResolvedValue(mockSyncStatus);

      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      await waitFor(() => {
        expect(screen.getByText('NCERT Sync Complete')).toBeInTheDocument();
      });

      expect(screen.getByText('3')).toBeInTheDocument(); // Failed syncs
    });

    it('should_handle_network_errors_gracefully', async () => {
      vi.mocked(contentManager.syncFromSource).mockRejectedValue(new Error('Network error'));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to sync content: Network error');
      });
    });
  });

  describe('localStorage integration', () => {
    it('should_load_last_sync_time_on_mount', () => {
      const lastSyncTime = '2024-01-15T10:00:00Z';
      vi.mocked(localStorage.getItem).mockReturnValue(lastSyncTime);

      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      expect(localStorage.getItem).toHaveBeenCalledWith('lastSyncTime');
      expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
    });
  });
});
