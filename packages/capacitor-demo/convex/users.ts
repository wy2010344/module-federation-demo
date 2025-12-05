import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        picture: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user exists by email
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name: args.name ?? existingUser.name,
                picture: args.picture ?? existingUser.picture,
            });
            return existingUser._id;
        }

        const newUserId = await ctx.db.insert("users", {
            email: args.email,
            name: args.name,
            picture: args.picture,
        });
        return newUserId;
    },
});

export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();
    },
});
