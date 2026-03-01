'use client';

import { Button } from '@heroui/react';
import { useQuery, useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from "@/convex/_generated/api";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.auth.loggedInUser);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center py-12 px-6 bg-white dark:bg-zinc-950 sm:items-start gap-8 shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800">
        <header className="flex w-full items-center justify-between border-b pb-6 border-zinc-100 dark:border-zinc-900">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Bookmark Manager</h1>
            <p className="text-sm text-zinc-500">Organize your favorite links into tabs.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {!isLoading && (
              isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-500 hidden sm:inline">Signed in as {user?.name ?? 'User'}</span>
                  <Button size="sm" variant="ghost" onPress={() => signOut()}>Sign out</Button>
                </div>
              ) : (
                <Button variant="primary" onPress={() => signIn('anonymous')}>Sign in</Button>
              )
            )}
          </div>
        </header>

        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow w-full gap-4 text-center">
            <h2 className="text-xl font-semibold">Welcome!</h2>
            <p className="text-zinc-500 max-w-sm">Please sign in to start managing your bookmarks. You can use anonymous sign in to try it out.</p>
            <Button variant="primary" size="lg" onPress={() => signIn('anonymous')}>Get Started</Button>
          </div>
        )}

        <footer className="mt-auto w-full pt-12 text-center text-xs text-zinc-400">
          Built with Next.js, Convex, and HeroUI
        </footer>
      </main>
    </div>
  );
}
