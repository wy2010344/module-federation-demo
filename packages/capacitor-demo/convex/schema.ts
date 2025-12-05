import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        name: v.optional(v.string()),
        picture: v.optional(v.string()),
        tokenIdentifier: v.optional(v.string()),
    })
        .index("by_email", ["email"])
        .index("by_token", ["tokenIdentifier"]),

    todos: defineTable({
        content: v.string(),
        images: v.optional(v.array(v.string())),

        creatorId: v.id("users"),
        assigneeEmail: v.string(),
        assigneeId: v.optional(v.id("users")),

        status: v.union(
            v.literal("pending"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("approved"),
            v.literal("rejected")
        ),

        parentId: v.optional(v.id("todos")),

        lastComment: v.optional(v.string()),
        lastCommentImages: v.optional(v.array(v.string())),
        creationTime: v.number(),

        // Edit history for the main task content
        contentEdits: v.optional(v.array(v.object({
            content: v.string(),
            images: v.optional(v.array(v.string())),
            timestamp: v.number(),
            userId: v.id("users"),
        }))),
    })
        .index("by_creator", ["creatorId"])
        .index("by_assignee_email", ["assigneeEmail"])
        .index("by_parent", ["parentId"])
        .searchIndex("search_content", {
            searchField: "content",
            filterFields: ["assigneeEmail", "creatorId"]
        }),

    logs: defineTable({
        todoId: v.id("todos"),
        userId: v.id("users"),
        action: v.union(
            v.literal("create"),
            v.literal("assign"),
            v.literal("mark_completed"),
            v.literal("mark_failed"),
            v.literal("approve"),
            v.literal("reject"),
            v.literal("comment"),
            v.literal("update")
        ),
        comment: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
        timestamp: v.number(),

        // Edit history for this specific log entry (feedback)
        edits: v.optional(v.array(v.object({
            comment: v.optional(v.string()),
            images: v.optional(v.array(v.string())),
            timestamp: v.number(),
        }))),
    }).index("by_todo", ["todoId"]),
});
