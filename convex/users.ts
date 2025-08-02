import { query } from "./_generated/server";

/**
 * Get the current authenticated user's information from the auth identity
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Extract user info from the subject ID for Convex Auth Password provider
    const authSubject = identity.subject;
    // Use the first part of the subject as a user identifier for the name
    const emailIdName = (identity.email ?? "").split("@")[0];

    // First, find the auth account using the subject/providerAccountId
    const authAccount = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), authSubject))
      .first();

    // Try alternative approaches if the direct match doesn't work
    if (!authAccount) {
      // Try matching with just the user ID part (first part before |)
      const userIdPart = authSubject.split("|")[0];

      const authAccountByUserId = await ctx.db
        .query("authAccounts")
        .filter((q) => q.eq(q.field("userId"), userIdPart))
        .first();

      if (authAccountByUserId) {
        const user = await ctx.db.get(authAccountByUserId.userId);

        if (user) {
          return {
            name: user.name || identity.name || `Student ${emailIdName}`,
            email:
              user.email ||
              identity.email ||
              `student-${emailIdName}@pagerush.com`,
            avatar:
              user.image ||
              identity.pictureUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${emailIdName}`,
          };
        }
      }
    }

    if (!authAccount) {
      // If no auth account found, use fallback data from identity
      return {
        name: identity.name ?? `Student ${emailIdName}`,
        email: identity.email ?? `student-${emailIdName}@pagerush.com`,
        avatar:
          identity.pictureUrl ??
          `https://api.dicebear.com/7.x/initials/svg?seed=${emailIdName}`,
      };
    }

    // Now get the actual user record using the userId from authAccount
    const user = await ctx.db.get(authAccount.userId);

    if (!user) {
      // If no user found, use fallback data from identity
      return {
        name: identity.name ?? `Student ${emailIdName}`,
        email: identity.email ?? `student-${emailIdName}@pagerush.com`,
        avatar:
          identity.pictureUrl ??
          `https://api.dicebear.com/7.x/initials/svg?seed=${emailIdName}`,
      };
    }

    // Return real user data from your users table
    return {
      name: user.name || identity.name || `Student ${emailIdName}`,
      email:
        user.email || identity.email || `student-${emailIdName}@pagerush.com`,
      avatar:
        user.image ||
        identity.pictureUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${emailIdName}`,
    };
  },
});

// Debug query to see all auth accounts
export const debugAuthAccounts = query({
  args: {},
  handler: async (ctx) => {
    const authAccounts = await ctx.db.query("authAccounts").collect();
    return authAccounts;
  },
});
