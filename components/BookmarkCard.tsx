'use client';

import { Card, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';

interface BookmarkCardProps {
  bookmark: Doc<'bookmarks'>;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const removeBookmark = useMutation(api.bookmarks.remove);

  const handleOpen = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleRemove = async () => {
    if (confirm('Are you sure you want to remove this bookmark?')) {
      await removeBookmark({ bookmarkId: bookmark._id });
    }
  };

  return (
    <Card onClick={handleOpen} className="w-full cursor-pointer hover:bg-zinc-50 transition-colors">
      <Card.Content className="flex flex-row items-center gap-4 p-3 overflow-hidden">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-100 rounded">
          {bookmark.favicon ? (
            <img src={bookmark.favicon} alt="" className="w-6 h-6 object-contain" />
          ) : (
            <div className="w-6 h-6 bg-zinc-300 rounded" />
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-semibold truncate">{bookmark.title}</h3>
          <p className="text-xs text-zinc-500 truncate">{bookmark.url}</p>
        </div>
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
           <Dropdown>
             <DropdownTrigger>
               <Button isIconOnly size="sm" variant="ghost">⋮</Button>
             </DropdownTrigger>
             <Dropdown.Popover>
               <Dropdown.Menu aria-label="Bookmark actions">
                 <Dropdown.Item key="remove" variant="danger" onPress={handleRemove}>
                   Remove
                 </Dropdown.Item>
               </Dropdown.Menu>
             </Dropdown.Popover>
           </Dropdown>
        </div>
      </Card.Content>
    </Card>
  );
}
