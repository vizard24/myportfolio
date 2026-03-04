'use server';

import type { Job, JobSearchFilters } from './adzuna-actions';

interface MantiksJob {
    id?: string | number;
    job_title?: string;
    title?: string;
    company?: string | { name?: string; domain?: string };
    location?: string;
    job_description?: string;
    description?: string;
    url?: string;
    apply_link?: string;
    publication_date?: string;
    date_published?: string;
    salary?: string;
    job_type?: string;
    contract_type?: string;
}

interface MantiksResponse {
    data?: MantiksJob[];
    results?: MantiksJob[];
    jobs?: MantiksJob[];
}

function normalizeCompanyName(company: MantiksJob['company']): string {
    if (!company) return 'Unknown';
    if (typeof company === 'string') return company;
    return company.name || company.domain || 'Unknown';
}

export async function searchMantiksAction(filters: JobSearchFilters): Promise<Job[]> {
    // Note: env var has typo MANKTIS (not MANTIKS) — preserved as-is
    const apiKey = process.env.MANKTIS_API_KEY;
    if (!apiKey) return [];

    try {
        // Mantiks uses GET with query params on /company/search
        const params = new URLSearchParams();
        if (filters.what) {
            params.set('job_title', filters.what);
            params.set('description', filters.what);
        }
        if (filters.where) params.set('location', filters.where);
        if (filters.max_days_old) {
            const since = new Date();
            since.setDate(since.getDate() - filters.max_days_old);
            params.set('published_since', since.toISOString().split('T')[0]);
        }
        params.set('limit', '15');

        const url = `https://api.mantiks.io/company/search?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Mantiks API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: MantiksResponse = await response.json();
        const jobs = data.data || data.results || data.jobs || [];

        return jobs
            .filter(item => item.job_title || item.title) // skip empty results
            .map((item, i) => ({
                id: `mantiks-${item.id ?? i}`,
                title: item.job_title || item.title || '',
                company: normalizeCompanyName(item.company),
                location: item.location || '',
                description: (item.job_description || item.description || '').replace(/<\/?[^>]+(>|$)/g, ''),
                url: item.url || item.apply_link || '',
                datePosted: item.publication_date || item.date_published || new Date().toISOString(),
                salary: item.salary || undefined,
                category: item.job_type || item.contract_type || 'Jobs',
                source: ['Mantiks'],
            }));
    } catch (error) {
        console.error('Mantiks search error:', error);
        return [];
    }
}
