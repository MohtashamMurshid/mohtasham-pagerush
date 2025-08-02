import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upload a document and extract its content
 */
export const uploadDocument = mutation({
  args: {
    title: v.string(),
    filename: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    content: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      filename: args.filename,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      content: args.content,
      userId,
      storageId: args.storageId,
      uploadedAt: now,
      lastModified: now,
    });

    return documentId;
  },
});

/**
 * Get all documents for the current user
 */
export const getUserDocuments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return documents;
  },
});

/**
 * Get a specific document by ID
 */
export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    // Check if user owns this document
    if (document.userId !== identity.subject) {
      throw new Error("Not authorized to access this document");
    }

    return document;
  },
});

/**
 * Delete a document
 */
export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    // Check if user owns this document
    if (document.userId !== identity.subject) {
      throw new Error("Not authorized to delete this document");
    }

    // Delete the file from storage
    await ctx.storage.delete(document.storageId);

    // Delete the document record
    await ctx.db.delete(args.documentId);
  },
});

/**
 * Search documents by content
 */
export const searchDocuments = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const results = await ctx.db
      .query("documents")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.searchTerm).eq("userId", userId)
      )
      .collect();

    return results;
  },
});

/**
 * Update document title and tags
 */
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    // Check if user owns this document
    if (document.userId !== identity.subject) {
      throw new Error("Not authorized to update this document");
    }

    const updates: Record<string, unknown> = {
      lastModified: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.tags !== undefined) {
      updates.tags = args.tags;
    }
    if (args.summary !== undefined) {
      updates.summary = args.summary;
    }

    await ctx.db.patch(args.documentId, updates);
  },
});

/**
 * Generate upload URL for file storage
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
