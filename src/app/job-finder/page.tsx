'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { JobSearch } from '@/components/app-tracker/job-search';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Loader } from 'lucide-react';

function JobFinderPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl text-center mb-4">
                    Job Finder
                </h1>
                <p className="text-xl text-muted-foreground sm:text-2xl text-center mb-12">
                    Search through thousands of live job postings to find your next role.
                </p>

                <div className="max-w-7xl mx-auto">
                    <JobSearch />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function JobFinderPageWrapper() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        router.replace('/');
        return null;
    }

    return <JobFinderPage />;
}
