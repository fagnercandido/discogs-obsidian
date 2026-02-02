import { requestUrl, RequestUrlParam, Notice } from 'obsidian';
import { DiscogsSettings, DiscogsRelease } from './types';

export class DiscogsAPI {
    settings: DiscogsSettings;
    baseUrl = 'https://api.discogs.com';

    constructor(settings: DiscogsSettings) {
        this.settings = settings;
    }

    async validateUser(username: string): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.baseUrl}/users/${username}`,
                method: 'GET',
                headers: {
                    'User-Agent': 'DiscogsObsidianPlugin/1.0'
                }
            });
            return response.status === 200;
        } catch (error) {
            console.warn('Discogs User Validation Error:', error);
            return false;
        }
    }

    async getCollectionSize(username: string): Promise<number | null> {
        try {
            const response = await this.requestWithRetry(`${this.baseUrl}/users/${username}/collection/folders/0/releases?per_page=1`);
            return response.pagination.items;
        } catch (error) {
            console.error('Failed to get collection size:', error);
            return null;
        }
    }

    async fetchCollection(
        username: string,
        onProgress: (progress: { page: number; totalPages: number; itemsLoaded: number }) => void,
        signal?: AbortSignal
    ): Promise<DiscogsRelease[]> {
        const releases: DiscogsRelease[] = [];
        let page = 1;
        let totalPages = 1;

        // We use the public endpoint: https://api.discogs.com/users/{username}/collection/folders/0/releases

        try {
            do {
                if (signal?.aborted) throw new Error('AbortError');

                const url = `${this.baseUrl}/users/${username}/collection/folders/0/releases?page=${page}&per_page=${this.settings.itemsPerPage}&sort=added&sort_order=desc`;
                const data = await this.requestWithRetry(url, 3, 2000, signal);

                if (data.releases) {
                    releases.push(...data.releases);
                }

                if (page === 1) {
                    totalPages = data.pagination.pages;
                }

                onProgress({
                    page: page,
                    totalPages: totalPages,
                    itemsLoaded: releases.length
                });

                page++;

                // Rate limiting delay (approx 25 req/min = ~2.4s per request)
                // We'll be safe with 2.5s
                if (page <= totalPages) {
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(resolve, 2500);
                        signal?.addEventListener('abort', () => {
                            clearTimeout(timeout);
                            reject(new Error('AbortError'));
                        });
                    });
                }

            } while (page <= totalPages);

        } catch (error: unknown) {
            new Notice(`Error fetching collection: ${error.message}`);
            throw error;
        }

        return releases;
    }

    async requestWithRetry(url: string, retries = 3, backoff = 2000, signal?: AbortSignal): Promise<any> {
        if (signal?.aborted) throw new Error('AbortError');
        try {
            const response = await requestUrl({
                url: url,
                method: 'GET',
                headers: {
                    'User-Agent': 'DiscogsObsidianPlugin/1.0'
                }
            });

            if (response.status === 429) {
                // Rate limit hit
                if (retries > 0) {
                    console.warn(`Rate limit hit, waiting ${backoff}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return this.requestWithRetry(url, retries - 1, backoff * 2);
                } else {
                    throw new Error('Rate limit exceeded');
                }
            }

            if (response.status >= 400) {
                if (retries > 0 && response.status >= 500) {
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return this.requestWithRetry(url, retries - 1, backoff * 2);
                }
                throw new Error(`API Error: ${response.status}`);
            }

            return response.json;
        } catch (error) {
            if (retries > 0) {
                console.warn(`Request failed, retrying... (${retries} left)`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.requestWithRetry(url, retries - 1, backoff * 2);
            }
            throw error;
        }
    }
}
