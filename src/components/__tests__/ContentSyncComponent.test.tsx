/**
 * Production-Grade Content Sync Component Tests
 * MAANG Standards: Test behavior, not implementation
 */

import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentSyncComponent } from '../ContentSyncComponent';
import { contentManager } from '../../services/ContentManager';
import type { ContentSyncStatus } from '../../types';

// Mock dependencies
jest.mock('../../services/ContentManager');
jest.mock('../../hooks/useOfflineDetection', () => ({
  useOfflineDetection: () => [true, false], // isOnline, wasOffline
}));

const mockContentManager = contentManager as jest.Mocked<typeof contentManager>;

describe('ContentSyncComponent', () => {
  const mockOnSyncComplete = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    (global.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (global.localStorage.setItem as jest.Mock).mockClear();
  });

  describe('rendering', () => {
    it('should_render_sync_interface_correctly', () => {
      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      expect(screen.getByText('Content Synchronization')).toBeInTheDocument();
      expect(screen.getByText('Sync real educational content from government sources')).toBeInTheDocument();
      expect(screen.getByText('Select Content Source')).toBeInTheDocument();
      expect(screen.getByText('NCERT Official')).toBeInTheDocument();
      expect(screen.getByText('DIKSHA Platform')).toBeInTheDocument();
      expect(screen.getByText('ePathshala')).toBeInTheDocument();
      expect(screen.getByText('SWAYAM')).toBeInTheDocument();
    });

    it('should_show_online_status', () => {
      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      expect(screen.getByText('Online - Ready to sync')).toBeInTheDocument();
      expect(screen.getByText('Online - Ready to sync')).toHaveClass('text-green-800');
    });

    it('should_show_offline_status_when_offline', () => {
      // Arrange
      jest.doMock('../../hooks/useOfflineDetection', () => ({
        useOfflineDetection: () => [false, false], // isOnline, wasOffline
      }));

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      expect(screen.getByText('Offline - Sync unavailable')).toBeInTheDocument();
    });
  });

  describe('source selection', () => {
    it('should_select_ncert_by_default', () => {
      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      const ncertButton = screen.getByText('NCERT Official');
      expect(ncertButton.closest('button')).toHaveClass('border-primary-500', 'bg-primary-50');
    });

    it('should_allow_source_selection', async () => {
      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const dikshaButton = screen.getByText('DIKSHA Platform');
      await user.click(dikshaButton);

      // Assert
      expect(dikshaButton.closest('button')).toHaveClass('border-primary-500', 'bg-primary-50');
    });

    it('should_disable_selection_when_offline', () => {
      // Arrange
      jest.doMock('../../hooks/useOfflineDetection', () => ({
        useOfflineDetection: () => [false, false], // isOnline, wasOffline
      }));

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      const ncertButton = screen.getByText('NCERT Official');
      expect(ncertButton.closest('button')).toBeDisabled();
    });
  });

  describe('sync functionality', () => {
    it('should_sync_successfully', async () => {
      // Arrange
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 10,
        syncedLessons: 10,
        failedSyncs: 0,
        pendingUpdates: 0,
      };

      mockContentManager.syncFromSource.mockResolvedValue(mockSyncStatus);

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        expect(mockContentManager.syncFromSource).toHaveBeenCalledWith('NCERT');
        expect(mockOnSyncComplete).toHaveBeenCalledWith(mockSyncStatus);
      });

      expect(screen.getByText('NCERT Sync Complete')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total lessons
      expect(screen.getByText('10')).toBeInTheDocument(); // Synced lessons
    });

    it('should_handle_sync_failures', async () => {
      // Arrange
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 10,
        syncedLessons: 7,
        failedSyncs: 3,
        pendingUpdates: 0,
      };

      mockContentManager.syncFromSource.mockResolvedValue(mockSyncStatus);

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('NCERT Sync Complete')).toBeInTheDocument();
      });

      expect(screen.getByText('7')).toBeInTheDocument(); // Synced lessons
      expect(screen.getByText('3')).toBeInTheDocument(); // Failed syncs
      expect(screen.getByText('Some lessons failed to sync. Please check your internet connection and try again.')).toBeInTheDocument();
    });

    it('should_handle_sync_errors', async () => {
      // Arrange
      mockContentManager.syncFromSource.mockRejectedValue(new Error('Network error'));

      // Mock window.alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to sync content: Network error');
      });

      mockAlert.mockRestore();
    });

    it('should_show_syncing_state', async () => {
      // Arrange
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 5,
        syncedLessons: 5,
        failedSyncs: 0,
        pendingUpdates: 0,
      };

      // Make sync take some time
      mockContentManager.syncFromSource.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSyncStatus), 100)),
      );

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
      expect(syncButton).toBeDisabled();
    });

    it('should_show_alert_when_offline', async () => {
      // Arrange
      jest.doMock('../../hooks/useOfflineDetection', () => ({
        useOfflineDetection: () => [false, false], // isOnline, wasOffline
      }));

      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      expect(mockAlert).toHaveBeenCalledWith('Internet connection required for content synchronization');

      mockAlert.mockRestore();
    });
  });

  describe('last sync time', () => {
    it('should_display_last_sync_time_from_localStorage', () => {
      // Arrange
      const lastSyncTime = '2024-01-15T10:00:00Z';
      (global.localStorage.getItem as jest.Mock).mockReturnValue(lastSyncTime);

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
      expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument(); // Formatted date
    });

    it('should_save_sync_time_to_localStorage', async () => {
      // Arrange
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 5,
        syncedLessons: 5,
        failedSyncs: 0,
        pendingUpdates: 0,
      };

      mockContentManager.syncFromSource.mockResolvedValue(mockSyncStatus);

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith(
          'lastSyncTime',
          expect.any(String),
        );
      });
    });
  });

  describe('sync status display', () => {
    it('should_show_success_status_with_green_icon', async () => {
      // Arrange
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 10,
        syncedLessons: 10,
        failedSyncs: 0,
        pendingUpdates: 0,
      };

      mockContentManager.syncFromSource.mockResolvedValue(mockSyncStatus);

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        const statusElement = screen.getByText('NCERT Sync Complete');
        expect(statusElement).toHaveClass('text-green-600');
      });
    });

    it('should_show_warning_status_with_yellow_icon', async () => {
      // Arrange
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 10,
        syncedLessons: 8,
        failedSyncs: 2,
        pendingUpdates: 0,
      };

      mockContentManager.syncFromSource.mockResolvedValue(mockSyncStatus);

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        const statusElement = screen.getByText('NCERT Sync Complete');
        expect(statusElement).toHaveClass('text-yellow-600');
      });
    });

    it('should_display_sync_statistics', async () => {
      // Arrange
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 15,
        syncedLessons: 12,
        failedSyncs: 2,
        pendingUpdates: 1,
      };

      mockContentManager.syncFromSource.mockResolvedValue(mockSyncStatus);

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument(); // Total lessons
        expect(screen.getByText('12')).toBeInTheDocument(); // Synced lessons
        expect(screen.getByText('2')).toBeInTheDocument(); // Failed syncs
        expect(screen.getByText('1')).toBeInTheDocument(); // Pending updates
      });
    });
  });

  describe('information section', () => {
    it('should_display_sync_information', () => {
      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      expect(screen.getByText('About Content Sync')).toBeInTheDocument();
      expect(screen.getByText(/Content is downloaded and stored locally for offline access/)).toBeInTheDocument();
      expect(screen.getByText(/Audio narration is automatically generated for each lesson/)).toBeInTheDocument();
      expect(screen.getByText(/Quizzes are created from NCERT exercises and questions/)).toBeInTheDocument();
      expect(screen.getByText(/All content is validated for educational accuracy/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should_have_proper_aria_labels', () => {
      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Online - Ready to sync')).toBeInTheDocument();
    });

    it('should_be_keyboard_navigable', async () => {
      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Focus on sync button and press Enter
      const syncButton = screen.getByText('Sync from NCERT Official');
      syncButton.focus();

      // Assert
      expect(syncButton).toHaveFocus();
    });
  });

  describe('error handling', () => {
    it('should_handle_network_errors_gracefully', async () => {
      // Arrange
      mockContentManager.syncFromSource.mockRejectedValue(new Error('Network error'));

      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to sync content: Network error');
      });

      mockAlert.mockRestore();
    });

    it('should_handle_unknown_errors', async () => {
      // Arrange
      mockContentManager.syncFromSource.mockRejectedValue(new Error('Unknown error'));

      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to sync content: Unknown error');
      });

      mockAlert.mockRestore();
    });
  });

  describe('component lifecycle', () => {
    it('should_load_last_sync_time_on_mount', () => {
      // Arrange
      const lastSyncTime = '2024-01-15T10:00:00Z';
      (global.localStorage.getItem as jest.Mock).mockReturnValue(lastSyncTime);

      // Act
      render(<ContentSyncComponent onSyncComplete={mockOnSyncComplete} />);

      // Assert
      expect(global.localStorage.getItem).toHaveBeenCalledWith('lastSyncTime');
    });

    it('should_not_call_onSyncComplete_when_not_provided', async () => {
      // Arrange
      const mockSyncStatus: ContentSyncStatus = {
        source: 'NCERT',
        lastSyncDate: '2024-01-15T10:00:00Z',
        totalLessons: 5,
        syncedLessons: 5,
        failedSyncs: 0,
        pendingUpdates: 0,
      };

      mockContentManager.syncFromSource.mockResolvedValue(mockSyncStatus);

      // Act
      render(<ContentSyncComponent />);

      const syncButton = screen.getByText('Sync from NCERT Official');
      await user.click(syncButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('NCERT Sync Complete')).toBeInTheDocument();
      });

      // onSyncComplete should not be called since it wasn't provided
      expect(mockOnSyncComplete).not.toHaveBeenCalled();
    });
  });
});
