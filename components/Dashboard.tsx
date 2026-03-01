'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { BookmarkCard } from './BookmarkCard';
import { AddBookmark } from './AddBookmark';
import { ProfilesTabs } from './ProfilesTabs';
import { useEffect, useState } from 'react';
import { Spinner } from '@heroui/react';

export function Dashboard() {
  const [selectedProfileId, setSelectedProfileId] = useState<Id<'profiles'>>();
  const profiles = useQuery(api.profiles.list);
  const defaultProfile = useQuery(api.profiles.getDefault);
  const ensureDefault = useMutation(api.profiles.ensureDefaultProfile);
  
  const bookmarks = useQuery(
    api.bookmarks.list, 
    selectedProfileId ? { profileId: selectedProfileId } : 'skip'
  );

  useEffect(() => {
    ensureDefault();
  }, [ensureDefault]);

  useEffect(() => {
    if (defaultProfile && !selectedProfileId) {
      setSelectedProfileId(defaultProfile._id);
    }
  }, [defaultProfile, selectedProfileId]);

  useEffect(() => {
    if (profiles && profiles.length > 0 && selectedProfileId) {
      const selectedExists = profiles.some(p => p._id === selectedProfileId);
      if (!selectedExists) {
        setSelectedProfileId(profiles[0]._id);
      }
    }
  }, [profiles, selectedProfileId]);

  if (!profiles || !selectedProfileId) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <ProfilesTabs 
        selectedProfileId={selectedProfileId} 
        onProfileSelect={setSelectedProfileId} 
      />
      
      <AddBookmark profileId={selectedProfileId} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {bookmarks ? (
          bookmarks.length > 0 ? (
            bookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark._id} bookmark={bookmark} />
            ))
          ) : (
            <p className="text-zinc-500 text-center col-span-full py-10">No bookmarks in this profile yet.</p>
          )
        ) : (
          <div className="col-span-full flex justify-center py-10">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
