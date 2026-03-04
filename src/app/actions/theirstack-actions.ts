'use server';

import type { Job, JobSearchFilters } from './adzuna-actions';

function toAlpha2Upper(code: string): string {
    return (code || 'ca').toUpperCase();
}

// Use a loose record so we can probe any field name the API returns
type TheirStackJob = Record<string, any>;

interface TheirStackResponse {
    data: TheirStackJob[];
    metadata?: { total: number };
}

function extractDescription(item: TheirStackJob): string {
    const raw =
        item.long_description ||
        item.short_description ||
        item.description ||
        item.snippet ||
        item.body ||
        item.responsibilities ||
        item.requirements ||
        item.summary ||
        '';
    return String(raw).replace(/<\/?[^>]+(>|$)/g, '').trim();
}

export async function searchTheirStackAction(filters: JobSearchFilters): Promise<Job[]> {
    const token = process.env.THEIRSTACK_API_KEY;
    if (!token) return [];

    try {
        const body: Record<string, unknown> = {
            limit: 15,
            page: 0,
            order_by: [{ desc: true, field: 'date_posted' }],
        };

        if (filters.what) body.job_title_or = [filters.what];
        if (filters.country) body.job_country_code_or = [toAlpha2Upper(filters.country)];
        if (filters.max_days_old) body.posted_at_max_age_days = filters.max_days_old;

        const response = await fetch('https://api.theirstack.com/v1/jobs/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`TheirStack API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: TheirStackResponse = await response.json();

        // Log first result keys so we know the exact field names returned
        if (data.data?.[0]) {
            console.log('[TheirStack] First result keys:', Object.keys(data.data[0]));
        }

        return (data.data || []).map(item => ({
            id: `theirstack-${item.id}`,
            title: item.job_title || item.title || '',
            company: item.company_object?.name || item.company_name || item.company || 'Unknown',
            location: item.location || item.city || item.country || item.company_object?.country_code || '',
            description: extractDescription(item),
            url: item.url || item.job_url || item.apply_url || '',
            datePosted: item.date_posted || item.posted_at || item.created_at || new Date().toISOString(),
            salary: item.salary_string || item.salary || undefined,
            category: item.job_categories?.[0] || item.category || 'Jobs',
            source: ['TheirStack'],
        }));
    } catch (error) {
        console.error('TheirStack search error:', error);
        return [];
    }
}
