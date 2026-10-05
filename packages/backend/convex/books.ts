import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("books").collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");
    return await ctx.db.insert("books", {
      title: args.title,
      author: args.author,
      addedBy: identity.tokenIdentifier,
    });
  },
});
