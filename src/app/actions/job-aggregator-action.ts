'use server';

import { searchJobsAction, type Job, type JobSearchFilters } from './adzuna-actions';
import { searchJoobleAction } from './jooble-actions';
import { searchTheirStackAction } from './theirstack-actions';
import { searchMantiksAction } from './mantiks-actions';

/** Normalize a string for dedup comparison */
function normKey(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/** Dedup key: title + company */
function dedupKey(job: Job): string {
    return `${normKey(job.title)}::${normKey(job.company)}`;
}

/**
 * Searches all 4 job sources in parallel, deduplicates by title+company,
 * and merges source tags. Source priority (richest data wins):
 * TheirStack > Mantiks > Adzuna > Jooble
 */
export async function searchAllJobsAction(
    filters: JobSearchFilters
): Promise<{ success: boolean; data?: Job[]; error?: string }> {
    // Fire all sources in parallel — failures don't block the others
    const [adzunaResult, joobleResult, theirStackResult, mantiksResult] = await Promise.allSettled([
        searchJobsAction(filters).then(r => (r.success ? (r.data ?? []).map(j => ({ ...j, source: ['Adzuna'] })) : [])),
        searchJoobleAction(filters),
        searchTheirStackAction(filters),
        searchMantiksAction(filters),
    ]);

    const adzunaJobs: Job[] = adzunaResult.status === 'fulfilled' ? adzunaResult.value : [];
    const joobleJobs: Job[] = joobleResult.status === 'fulfilled' ? joobleResult.value : [];
    const theirStackJobs: Job[] = theirStackResult.status === 'fulfilled' ? theirStackResult.value : [];
    const mantiksJobs: Job[] = mantiksResult.status === 'fulfilled' ? mantiksResult.value : [];

    // Log which sources returned results
    console.log(`Job sources: Adzuna=${adzunaJobs.length}, Jooble=${joobleJobs.length}, TheirStack=${theirStackJobs.length}, Mantiks=${mantiksJobs.length}`);

    // Priority order: TheirStack wins ties > Mantiks > Adzuna > Jooble
    const orderedSources = [theirStackJobs, mantiksJobs, adzunaJobs, joobleJobs];

    const seen = new Map<string, Job>();

    for (const sourceJobs of orderedSources) {
        for (const job of sourceJobs) {
            const key = dedupKey(job);
            if (!key || key === '::') continue;

            if (seen.has(key)) {
                // Merge source tags onto the winner
                const existing = seen.get(key)!;
                const merged = Array.from(new Set([...(existing.source ?? []), ...(job.source ?? [])]));
                seen.set(key, { ...existing, source: merged });
            } else {
                seen.set(key, job);
            }
        }
    }

    const merged = Array.from(seen.values());

    if (merged.length === 0 && adzunaJobs.length === 0 && joobleJobs.length === 0 && theirStackJobs.length === 0 && mantiksJobs.length === 0) {
        return { success: false, error: 'No results from any job source' };
    }

    return { success: true, data: merged };
}
