import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        return await ctx.db
            .query('profiles')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .collect();
    },
});

export const getDefault = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }

        const defaultProfile = await ctx.db
            .query('profiles')
            .withIndex('by_user_default', (q) => q.eq('userId', userId).eq('isDefault', true))
            .first();

        if (defaultProfile) {
            return defaultProfile;
        }

        // If no default profile exists, return the first profile
        return await ctx.db
            .query('profiles')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .first();
    },
});

export const ensureDefaultProfile = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('Not authenticated');
        }

        // Check if user already has any profiles
        const existingProfiles = await ctx.db
            .query('profiles')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .collect();

        // If no profiles exist, create a default one
        if (existingProfiles.length === 0) {
            return await ctx.db.insert('profiles', {
                name: 'Default',
                userId,
                isDefault: true,
                color: '#3B82F6', // Blue color
            });
        }

        // If profiles exist but none are default, make the first one default
        const hasDefault = existingProfiles.some((p) => p.isDefault);
        if (!hasDefault && existingProfiles.length > 0) {
            await ctx.db.patch(existingProfiles[0]._id, { isDefault: true });
            return existingProfiles[0]._id;
        }

        return null;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        color: v.string(),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('Not authenticated');
        }

        // If this is set as default, unset other defaults
        if (args.isDefault) {
            const existingProfiles = await ctx.db
                .query('profiles')
                .withIndex('by_user', (q) => q.eq('userId', userId))
                .collect();

            for (const profile of existingProfiles) {
                if (profile.isDefault) {
                    await ctx.db.patch(profile._id, { isDefault: false });
                }
            }
        }

        return await ctx.db.insert('profiles', {
            name: args.name,
            userId,
            isDefault: args.isDefault || false,
            color: args.color,
        });
    },
});

export const setDefault = mutation({
    args: {
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

        // Unset all other defaults
        const existingProfiles = await ctx.db
            .query('profiles')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .collect();

        for (const p of existingProfiles) {
            await ctx.db.patch(p._id, { isDefault: p._id === args.profileId });
        }
    },
});

export const remove = mutation({
    args: {
        profileId: v.id('profiles'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('Not authenticated');
        }

        const profile = await ctx.db.get(args.profileId);
        if (!profile || profile.userId !== userId) {
            throw new Error('Profile not found');
        }

        // Delete all bookmarks in this profile
        const bookmarks = await ctx.db
            .query('bookmarks')
            .withIndex('by_profile', (q) => q.eq('profileId', args.profileId))
            .collect();

        for (const bookmark of bookmarks) {
            await ctx.db.delete(bookmark._id);
        }

        await ctx.db.delete(args.profileId);
    },
});
