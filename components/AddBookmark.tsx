'use client';

import { Input, Button, Spinner } from '@heroui/react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';

interface AddBookmarkProps {
  profileId: Id<'profiles'>;
}

export function AddBookmark({ profileId }: AddBookmarkProps) {
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const addBookmark = useAction(api.bookmarks.add);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isAdding) return;

    setIsAdding(true);
    try {
      // Basic URL validation
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      
      await addBookmark({ url: formattedUrl, profileId });
      setUrl('');
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      alert('Failed to add bookmark. Please check the URL.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="flex gap-2 w-full">
      <Input
        placeholder="Enter URL to bookmark..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isAdding}
        className="flex-grow"
      />
      <Button variant="primary" type="submit" isDisabled={isAdding}>
        {isAdding ? <Spinner size="sm" color="current" /> : 'Add'}
      </Button>
    </form>
  );
}
