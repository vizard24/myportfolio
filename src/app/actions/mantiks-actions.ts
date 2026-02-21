'use server';

import type { Job, JobSearchFilters } from './adzuna-actions';

interface MantiksJob {
    id: string | number;
    job_title?: string;
    title?: string;
    company_name?: string;
    company?: { name?: string };
    location?: string;
    job_description?: string;
    description?: string;
    url?: string;
    apply_link?: string;
    publication_date?: string;
    date_posted?: string;
    salary?: string;
    job_type?: string;
}

interface MantiksResponse {
    data?: MantiksJob[];
    results?: MantiksJob[];
    jobs?: MantiksJob[];
}

export async function searchMantiksAction(filters: JobSearchFilters): Promise<Job[]> {
    // Note: env var has a typo — MANKTIS_API_KEY (not MANTIKS)
    const apiKey = process.env.MANKTIS_API_KEY;
    if (!apiKey) return [];

    try {
        const body: Record<string, unknown> = {
            limit: 15,
            page: 1,
        };

        if (filters.what) {
            body.job_title = filters.what;
            body.keywords = filters.what;
        }
        if (filters.where) body.location = filters.where;
        if (filters.max_days_old) {
            const date = new Date();
            date.setDate(date.getDate() - filters.max_days_old);
            body.published_since = date.toISOString().split('T')[0];
        }

        const response = await fetch('https://api.mantiks.io/v1/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`Mantiks API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: MantiksResponse = await response.json();
        const jobs = data.data || data.results || data.jobs || [];

        return jobs.map(item => ({
            id: `mantiks-${item.id}`,
            title: item.job_title || item.title || '',
            company: item.company?.name || item.company_name || 'Unknown',
            location: item.location || '',
            description: (item.job_description || item.description || '').replace(/<\/?[^>]+(>|$)/g, ''),
            url: item.url || item.apply_link || '',
            datePosted: item.publication_date || item.date_posted || new Date().toISOString(),
            salary: item.salary || undefined,
            category: item.job_type || 'Jobs',
            source: ['Mantiks'],
        }));
    } catch (error) {
        console.error('Mantiks search error:', error);
        return [];
    }
}
