import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

const applicationTables = {
    profiles: defineTable({
        name: v.string(),
        userId: v.id('users'),
        isDefault: v.boolean(),
        color: v.string(),
    })
        .index('by_user', ['userId'])
        .index('by_user_default', ['userId', 'isDefault']),

    bookmarks: defineTable({
        url: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        favicon: v.optional(v.string()),
        profileId: v.id('profiles'),
        userId: v.id('users'),
        addedAt: v.number(),
    })
        .index('by_profile', ['profileId'])
        .index('by_user', ['userId'])
        .index('by_profile_added', ['profileId', 'addedAt']),
};

export default defineSchema({
    ...authTables,
    ...applicationTables,
});
