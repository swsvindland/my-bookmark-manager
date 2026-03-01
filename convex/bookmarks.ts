import { v } from 'convex/values';
import { query, mutation, action } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';

export const list = query({
    args: {
        profileId: v.id('profiles'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        // Verify the profile belongs to the user
        const profile = await ctx.db.get(args.profileId);
        if (!profile || profile.userId !== userId) {
            return [];
        }

        return await ctx.db
            .query('bookmarks')
            .withIndex('by_profile_added', (q) => q.eq('profileId', args.profileId))
            .order('desc')
            .collect();
    },
});

export const add = action({
    args: {
        url: v.string(),
        profileId: v.id('profiles'),
    },
    handler: async (ctx, args): Promise<Id<'bookmarks'>> => {
        // Fetch metadata for the URL
        let title = args.url;
        let description = '';
        let favicon = '';

        try {
            const response = await fetch(args.url);
            const html = await response.text();

            // Extract title
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) {
                title = titleMatch[1].trim();
            }

            // Extract description
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
            if (descMatch) {
                description = descMatch[1].trim();
            }

            // Extract favicon
            const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
            if (faviconMatch) {
                let faviconUrl = faviconMatch[1];
                if (faviconUrl.startsWith('/')) {
                    const urlObj = new URL(args.url);
                    faviconUrl = `${urlObj.protocol}//${urlObj.host}${faviconUrl}`;
                } else if (!faviconUrl.startsWith('http')) {
                    const urlObj = new URL(args.url);
                    faviconUrl = `${urlObj.protocol}//${urlObj.host}/${faviconUrl}`;
                }
                favicon = faviconUrl;
            } else {
                // Fallback to default favicon location
                const urlObj = new URL(args.url);
                favicon = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
            }
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
            // Use URL as title if metadata fetch fails
        }

        return await ctx.runMutation(api.bookmarks.create, {
            url: args.url,
            title,
            description,
            favicon,
            profileId: args.profileId,
        });
    },
});

export const create = mutation({
    args: {
        url: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        favicon: v.optional(v.string()),
        profileId: v.id('profiles'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('Not authenticated');
        }

        // Verify the profile belongs to the user
        const profile = await ctx.db.get(args.profileId);
        if (!profile || profile.userId !== userId) {
            throw new Error('Profile not found');
        }

        return await ctx.db.insert('bookmarks', {
            url: args.url,
            title: args.title,
            description: args.description,
            favicon: args.favicon,
            profileId: args.profileId,
            userId,
            addedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: {
        bookmarkId: v.id('bookmarks'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('Not authenticated');
        }

        const bookmark = await ctx.db.get(args.bookmarkId);
        if (!bookmark || bookmark.userId !== userId) {
            throw new Error('Bookmark not found');
        }

        await ctx.db.delete(args.bookmarkId);
    },
});

export const update = mutation({
    args: {
        bookmarkId: v.id('bookmarks'),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('Not authenticated');
        }

        const bookmark = await ctx.db.get(args.bookmarkId);
        if (!bookmark || bookmark.userId !== userId) {
            throw new Error('Bookmark not found');
        }

        const updates: any = {};
        if (args.title !== undefined) updates.title = args.title;
        if (args.description !== undefined) updates.description = args.description;

        await ctx.db.patch(args.bookmarkId, updates);
    },
});
