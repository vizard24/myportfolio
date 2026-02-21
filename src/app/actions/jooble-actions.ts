'use server';

import type { Job, JobSearchFilters } from './adzuna-actions';

interface JoobleJob {
    title: string;
    location: string;
    snippet: string;
    salary: string;
    source: string;
    type: string;
    link: string;
    company: string;
    updated: string; // ISO date
    id: string;
}

interface JoobleResponse {
    totalCount: number;
    jobs: JoobleJob[];
}

export async function searchJoobleAction(filters: JobSearchFilters): Promise<Job[]> {
    const apiKey = process.env.JOOBLE_API_KEY;
    if (!apiKey) return [];

    try {
        const body = {
            keywords: filters.what || '',
            location: filters.where || '',
            page: filters.page || 1,
            ResultOnPage: 15,
        };

        const response = await fetch(`https://jooble.org/api/${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`Jooble API error: ${response.status}`);
            return [];
        }

        const data: JoobleResponse = await response.json();

        return (data.jobs || []).map(item => ({
            id: `jooble-${item.id}`,
            title: item.title?.replace(/<\/?[^>]+(>|$)/g, '') || '',
            company: item.company || 'Unknown',
            location: item.location || '',
            description: item.snippet?.replace(/<\/?[^>]+(>|$)/g, '') || '',
            url: item.link || '',
            datePosted: item.updated || new Date().toISOString(),
            salary: item.salary || undefined,
            category: item.type || 'Jobs',
            source: ['Jooble'],
        }));
    } catch (error) {
        console.error('Jooble search error:', error);
        return [];
    }
}
