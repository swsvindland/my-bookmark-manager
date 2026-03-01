'use client';

import Image from "next/image";
import { Button } from '@heroui/react';
import { useQuery, useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from "@/convex/_generated/api";

export default function Home() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.auth.loggedInUser);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start gap-6">
        <div className="flex items-center gap-3">
          {!isLoading && (
            isAuthenticated ? (
              <>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Signed in as: {user?.name ?? user?._id}</span>
                <Button onPress={() => signOut()}>Sign out</Button>
              </>
            ) : (
              <>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Not signed in</span>
                <Button onPress={() => signIn('anonymous')}>Anon sign in</Button>
              </>
            )
          )}
        </div>

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
      </main>
    </div>
  );
}
