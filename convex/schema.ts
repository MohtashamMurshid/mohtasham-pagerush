import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  documents: defineTable({
    title: v.string(),
    filename: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    content: v.string(), // Extracted text content
    summary: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    userId: v.string(), // Owner of the document
    storageId: v.id("_storage"), // File storage reference
    uploadedAt: v.number(),
    lastModified: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_uploaded_at", ["uploadedAt"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId"],
    }),
});

export default schema;
