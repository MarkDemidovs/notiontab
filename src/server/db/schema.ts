// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `wegotit_${name}`);

export const profiles = createTable(
  "profile",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    clerkUserId: d.varchar({ length: 256 }).notNull().unique(), // From Clerk
    fullName: d.varchar({ length: 256 }),
    bio: d.text(),
    avatarUrl: d.varchar({ length: 512 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("clerk_user_id_idx").on(t.clerkUserId)],
);

export const projects = createTable(
  "project",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    ownerId: d.integer().notNull().references(() => users.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("owner_id_idx").on(t.ownerId),
    index("name_idx").on(t.name),
  ],
);

export const projectRolesNeeded = createTable(
  "project_role_needed",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    projectId: d.integer().notNull().references(() => projects.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    slotsNeeded: d.integer().notNull().default(1),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (t) => [index("project_roles_needed_project_id_idx").on(t.projectId)],
);

export const applications = createTable(
  "application",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d.integer().notNull().references(() => users.id, { onDelete: "cascade" }),
    projectRoleNeededId: d.integer().notNull().references(() => projectRolesNeeded.id, { onDelete: "cascade" }),
    status: d.varchar({ length: 50 }).notNull().default("pending"),
    message: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("applications_user_id_idx").on(t.userId),
    index("project_role_needed_id_idx").on(t.projectRoleNeededId),
    index("status_idx").on(t.status),
  ],
);

export const projectMembers = createTable(
  "project_member",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    projectId: d.integer().notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: d.integer().notNull().references(() => users.id, { onDelete: "cascade" }),
    role: d.varchar({ length: 50 }).notNull().default("member"),
    joinedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (t) => [
    index("project_members_project_id_idx").on(t.projectId),
    index("project_members_user_id_idx").on(t.userId),
  ],
);

export const notifications = createTable(
  "notification",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d.integer().notNull().references(() => users.id, { onDelete: "cascade" }),
    projectId: d.integer().references(() => projects.id, { onDelete: "cascade" }),
    type: d.varchar({ length: 100 }).notNull(),
    message: d.text().notNull(),
    isRead: d.boolean().notNull().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (t) => [
    index("notifications_user_id_idx").on(t.userId),
    index("is_read_idx").on(t.isRead),
  ],
);