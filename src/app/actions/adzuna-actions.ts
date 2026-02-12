'use server';

interface AdzunaJob {
    id: string;
    title: string;
    description: string;
    company: { display_name: string };
    location: { display_name: string };
    created: string;
    redirect_url: string;
    salary_min?: number;
    salary_max?: number;
    contract_type?: string;
    category: { label: string; tag: string };
}

interface AdzunaResponse {
    results: AdzunaJob[];
    count: number;
    mean_salary?: number;
}

export interface JobSearchFilters {
    what?: string;
    where?: string;
    max_days_old?: number;
    category?: string; // category tag, e.g., 'it-jobs'
    page?: number;
    country?: string; // e.g., 'fr', 'gb', 'us'
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    datePosted: string;
    salary?: string;
    category: string;
}

export async function searchJobsAction(filters: JobSearchFilters): Promise<{ success: boolean; data?: Job[]; count?: number; error?: string }> {
    try {
        const appId = process.env.ADZUNA_APP_ID;
        const appKey = process.env.ADZUNA_APP_KEY;

        if (!appId || !appKey) {
            console.error('Adzuna API credentials missing');
            return { success: false, error: 'API configuration error' };
        }

        const country = filters.country || 'fr'; // Default to France as requested (or inferred)
        const page = filters.page || 1;

        const params = new URLSearchParams({
            app_id: appId,
            app_key: appKey,
            results_per_page: '20',
        });

        if (filters.what) params.append('what', filters.what);
        if (filters.where) params.append('where', filters.where);
        if (filters.max_days_old) params.append('max_days_old', filters.max_days_old.toString());
        if (filters.category) params.append('category', filters.category);

        // Adzuna API URL structure: https://api.adzuna.com/v1/api/jobs/{country}/search/{page}
        const apiUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params.toString()}`;

        console.log(`Fetching jobs from Adzuna: ${apiUrl.replace(appId, '***').replace(appKey, '***')}`);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error(`Adzuna API error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`Adzuna API Error Details: ${errorText}`);
            return { success: false, error: `API Error: ${response.statusText}` };
        }

        const data: AdzunaResponse = await response.json();

        const jobs: Job[] = data.results.map(item => ({
            id: String(item.id),
            title: item.title.replace(/<\/?[^>]+(>|$)/g, ""), // simple strip tags
            company: item.company.display_name,
            location: item.location.display_name,
            description: item.description.replace(/<\/?[^>]+(>|$)/g, ""),
            url: item.redirect_url,
            datePosted: item.created,
            category: item.category.label,
            salary: item.salary_min ? `${item.salary_min} - ${item.salary_max}` : undefined
        }));

        return { success: true, data: jobs, count: data.count };

    } catch (error) {
        console.error('Server Action Error (Adzuna):', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error searching jobs'
        };
    }
}
