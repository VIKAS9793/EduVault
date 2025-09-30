/**
 * Government Content Fetcher Service
 * Handles syncing with government education APIs (NCERT, DIKSHA)
 * Implements secure, rate-limited API calls with retry logic
 */

import axios, { AxiosError } from 'axios';
import type { Lesson, APIResponse } from '../types';
import { lessonEngine } from './LessonEngine';

// Security: Only allow approved government domains
const APPROVED_GOV_APIS = ['https://api.ncert.gov.in', 'https://diksha.gov.in/api'] as const;

type GovAPI = (typeof APPROVED_GOV_APIS)[number];

interface FetchConfig {
  baseURL: GovAPI;
  timeout: number;
  maxRetries: number;
}

class GovContentFetcher {
  private readonly config: FetchConfig = {
    baseURL: 'https://api.ncert.gov.in',
    timeout: 10000,
    maxRetries: 3,
  };

  /**
   * Fetch lessons from government API
   * @param endpoint - API endpoint path
   * @returns Fetched lessons
   */
  async fetchLessons(endpoint = '/lessons'): Promise<Lesson[]> {
    try {
      const response = await this.makeRequest<Lesson[]>(endpoint);
      return response.data ?? [];
    } catch (error) {
      console.error('Failed to fetch lessons from government API:', error);
      return [];
    }
  }

  /**
   * Sync lessons with local database
   * @returns Number of lessons synchronized
   */
  async syncLessons(): Promise<number> {
    const lessons = await this.fetchLessons();

    if (lessons.length > 0) {
      await lessonEngine.saveLessons(lessons);
    }

    return lessons.length;
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    retries = 0
  ): Promise<APIResponse<T>> {
    try {
      const response = await axios.get<APIResponse<T>>(`${this.config.baseURL}${endpoint}`, {
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      // Retry on network errors or 5xx responses
      if (
        retries < this.config.maxRetries &&
        (axiosError.code === 'ECONNABORTED' ||
          axiosError.code === 'ERR_NETWORK' ||
          (axiosError.response?.status ?? 0) >= 500)
      ) {
        // Exponential backoff
        await new Promise((resolve) => {
          setTimeout(resolve, 2 ** retries * 1000);
        });
        return this.makeRequest<T>(endpoint, retries + 1);
      }

      throw new Error(`API request failed: ${axiosError.message}`);
    }
  }

  /**
   * Check API health/availability
   */
  async checkAPIHealth(): Promise<boolean> {
    try {
      await this.makeRequest<{ status: string }>('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const govContentFetcher = new GovContentFetcher();
