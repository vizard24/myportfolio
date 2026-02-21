'use server';

import type { Job, JobSearchFilters } from './adzuna-actions';

// Country code mapping: Adzuna uses 'ca', TheirStack uses 'CA'
function toAlpha2Upper(code: string): string {
    return (code || 'ca').toUpperCase();
}

interface TheirStackJob {
    id: string | number;
    job_title?: string;
    company_name?: string;
    company_object?: { name?: string; country_code?: string };
    location?: string;
    long_description?: string;
    short_description?: string;
    url?: string;
    date_posted?: string;
    salary_string?: string;
    job_categories?: string[];
}

interface TheirStackResponse {
    data: TheirStackJob[];
    metadata?: { total: number };
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

        return (data.data || []).map(item => ({
            id: `theirstack-${item.id}`,
            title: item.job_title || '',
            company: item.company_object?.name || item.company_name || 'Unknown',
            location: item.location || item.company_object?.country_code || '',
            description: (item.long_description || item.short_description || '').replace(/<\/?[^>]+(>|$)/g, ''),
            url: item.url || '',
            datePosted: item.date_posted || new Date().toISOString(),
            salary: item.salary_string || undefined,
            category: item.job_categories?.[0] || 'Jobs',
            source: ['TheirStack'],
        }));
    } catch (error) {
        console.error('TheirStack search error:', error);
        return [];
    }
}
