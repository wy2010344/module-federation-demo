import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper to get current user by email
async function getCurrentUser(ctx: any, email: string) {
    const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", email))
        .unique();
    if (!user) {
        throw new Error("User not found: " + email);
    }
    return user;
}

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
    args: {
        userEmail: v.string(),
        content: v.string(),
        assigneeEmail: v.string(),
        parentId: v.optional(v.id("todos")),
        images: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx, args.userEmail);

        let assignee = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.assigneeEmail))
            .unique();

        if (!assignee) {
            const newUserId = await ctx.db.insert("users", {
                email: args.assigneeEmail,
            });
            assignee = await ctx.db.get(newUserId);
        }

        const todoId = await ctx.db.insert("todos", {
            content: args.content,
            creatorId: user._id,
            assigneeEmail: args.assigneeEmail,
            assigneeId: assignee?._id,
            status: "pending",
            parentId: args.parentId,
            images: args.images,
            creationTime: Date.now(),
        });

        await ctx.db.insert("logs", {
            todoId,
            userId: user._id,
            action: "create",
            timestamp: Date.now(),
        });

        return todoId;
    },
});

export const editTodoContent = mutation({
    args: {
        userEmail: v.string(),
        todoId: v.id("todos"),
        content: v.string(),
        images: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx, args.userEmail);
        const todo = await ctx.db.get(args.todoId);
        if (!todo) throw new Error("Todo not found");
        if (todo.creatorId !== user._id) throw new Error("Only creator can edit content");

        // Save old content to history
        const editEntry = {
            content: todo.content,
            images: todo.images,
            timestamp: Date.now(),
            userId: user._id,
        };

        await ctx.db.patch(args.todoId, {
            content: args.content,
            images: args.images,
            contentEdits: [...(todo.contentEdits || []), editEntry],
        });

        await ctx.db.insert("logs", {
            todoId: args.todoId,
            userId: user._id,
            action: "update",
            comment: "Updated task details",
            timestamp: Date.now(),
        });
    },
});

export const editLogEntry = mutation({
    args: {
        userEmail: v.string(),
        logId: v.id("logs"),
        comment: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx, args.userEmail);
        const log = await ctx.db.get(args.logId);
        if (!log) throw new Error("Log not found");
        if (log.userId !== user._id) throw new Error("Only author can edit log");

        // Save old content to history
        const editEntry = {
            comment: log.comment,
            images: log.images,
            timestamp: Date.now(),
        };

        await ctx.db.patch(args.logId, {
            comment: args.comment,
            images: args.images,
            edits: [...(log.edits || []), editEntry],
        });
    },
});

export const listAssigned = query({
    args: {
        userEmail: v.string(),
        statusFilter: v.optional(v.string()),
        searchQuery: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let todos;

        if (args.searchQuery) {
            todos = await ctx.db
                .query("todos")
                .withSearchIndex("search_content", (q) =>
                    q.search("content", args.searchQuery!)
                        .eq("assigneeEmail", args.userEmail)
                )
                .collect();
        } else {
            todos = await ctx.db
                .query("todos")
                .withIndex("by_assignee_email", (q) => q.eq("assigneeEmail", args.userEmail))
                .collect();
        }

        if (args.statusFilter) {
            todos = todos.filter(t => {
                if (args.statusFilter === 'completed') {
                    return t.status === 'completed' || t.status === 'approved';
                } else if (args.statusFilter === 'incomplete') {
                    return t.status === 'pending' || t.status === 'failed' || t.status === 'rejected';
                }
                return true;
            });
        }

        return todos.sort((a, b) => b.creationTime - a.creationTime);
    },
});

export const listCreated = query({
    args: {
        userEmail: v.string(),
        statusFilter: v.optional(v.string()),
        searchQuery: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx, args.userEmail);
        let todos;

        if (args.searchQuery) {
            todos = await ctx.db
                .query("todos")
                .withSearchIndex("search_content", (q) =>
                    q.search("content", args.searchQuery!)
                        .eq("creatorId", user._id)
                )
                .collect();
        } else {
            todos = await ctx.db
                .query("todos")
                .withIndex("by_creator", (q) => q.eq("creatorId", user._id))
                .collect();
        }

        if (args.statusFilter) {
            todos = todos.filter(t => {
                if (args.statusFilter === 'review') {
                    return t.status === 'completed' || t.status === 'failed';
                } else if (args.statusFilter === 'incomplete') {
                    return t.status === 'pending' || t.status === 'rejected';
                } else if (args.statusFilter === 'completed') {
                    return t.status === 'approved';
                } else if (args.statusFilter === 'all') {
                    return true;
                }
                return true;
            });
        }

        return todos.sort((a, b) => b.creationTime - a.creationTime);
    },
});

export const getById = query({
    args: { id: v.id("todos") },
    handler: async (ctx, args) => {
        const todo = await ctx.db.get(args.id);
        if (!todo) return null;

        const creator = await ctx.db.get(todo.creatorId);
        const assignee = todo.assigneeId ? await ctx.db.get(todo.assigneeId) : null;

        const imageUrls = todo.images ? await Promise.all(
            todo.images.map(async (storageId) => await ctx.storage.getUrl(storageId))
        ) : [];

        return {
            ...todo,
            creator,
            assignee,
            imageUrls,
        };
    },
});

export const getSubtasks = query({
    args: { parentId: v.id("todos") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("todos")
            .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
            .collect();
    },
});

export const getLogs = query({
    args: { todoId: v.id("todos") },
    handler: async (ctx, args) => {
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_todo", (q) => q.eq("todoId", args.todoId))
            .order("desc")
            .collect();

        const enrichedLogs = await Promise.all(
            logs.map(async (log) => {
                const user = await ctx.db.get(log.userId);
                const imageUrls = log.images ? await Promise.all(
                    log.images.map(async (storageId) => await ctx.storage.getUrl(storageId))
                ) : [];
                return { ...log, user, imageUrls };
            })
        );

        return enrichedLogs;
    },
});

export const updateStatus = mutation({
    args: {
        userEmail: v.string(),
        todoId: v.id("todos"),
        status: v.union(
            v.literal("pending"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("approved"),
            v.literal("rejected")
        ),
        comment: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx, args.userEmail);
        const todo = await ctx.db.get(args.todoId);
        if (!todo) throw new Error("Todo not found");

        if (todo.status === args.status && !args.comment && (!args.images || args.images.length === 0)) {
            return;
        }

        const isAssignee = todo.assigneeEmail === user.email;
        const isCreator = todo.creatorId === user._id;

        if (args.status === "completed" || args.status === "failed") {
            if (!isAssignee) throw new Error("Only assignee can mark complete/fail");
        }

        if (args.status === "approved" || args.status === "rejected") {
            if (!isCreator) throw new Error("Only creator can approve/reject");
        }

        let dbStatus = args.status;
        if (args.status === 'rejected') {
            dbStatus = 'pending';
        }

        await ctx.db.patch(args.todoId, {
            status: dbStatus,
            lastComment: args.comment,
            lastCommentImages: args.images,
        });

        await ctx.db.insert("logs", {
            todoId: args.todoId,
            userId: user._id,
            action: args.status === "completed" ? "mark_completed" :
                args.status === "failed" ? "mark_failed" :
                    args.status === "approved" ? "approve" :
                        args.status === "rejected" ? "reject" :
                            args.status === "pending" ? "update" : "update",
            comment: args.comment,
            images: args.images,
            timestamp: Date.now(),
        });
    },
});
