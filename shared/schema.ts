import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Email or USN
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "proctor", "admin"] }).notNull().default("student"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  usn: text("usn").notNull().unique(),
  department: text("department").notNull(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  batch: text("batch").notNull(),
  proctorId: integer("proctor_id"), // Can be null initially
  profilePhotoUrl: text("profile_photo_url"),
});

export const proctors = pgTable("proctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  employeeId: text("employee_id").notNull().unique(),
  department: text("department").notNull(),
  designation: text("designation").notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  venue: text("venue").notNull(),
  postedBy: integer("posted_by").notNull().references(() => users.id),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  bannerUrl: text("banner_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const participations = pgTable("participations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  eventId: integer("event_id").references(() => events.id), // Nullable for manual entry if needed, but spec implies event selection
  eventName: text("event_name").notNull(), // Store name in case event is deleted or manual entry
  role: text("role").notNull(),
  durationDays: integer("duration_days").default(1),
  achievement: text("achievement"),
  description: text("description"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  proctorFeedback: text("proctor_feedback"),
});

export const participationProofs = pgTable("participation_proofs", {
  id: serial("id").primaryKey(),
  participationId: integer("participation_id").notNull().references(() => participations.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // event, submission, alert
  isRead: boolean("is_read").default(false).notNull(),
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  proctorProfile: one(proctors, {
    fields: [users.id],
    references: [proctors.userId],
  }),
  postedEvents: many(events),
  notifications: many(notifications),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  proctor: one(proctors, {
    fields: [students.proctorId],
    references: [proctors.id],
  }),
  participations: many(participations),
}));

export const proctorsRelations = relations(proctors, ({ one, many }) => ({
  user: one(users, {
    fields: [proctors.userId],
    references: [users.id],
  }),
  students: many(students),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  author: one(users, {
    fields: [events.postedBy],
    references: [users.id],
  }),
  participations: many(participations),
}));

export const participationsRelations = relations(participations, ({ one, many }) => ({
  student: one(students, {
    fields: [participations.studentId],
    references: [students.id],
  }),
  event: one(events, {
    fields: [participations.eventId],
    references: [events.id],
  }),
  reviewer: one(users, {
    fields: [participations.reviewedBy],
    references: [users.id],
  }),
  proofs: many(participationProofs),
}));

export const participationProofsRelations = relations(participationProofs, ({ one }) => ({
  participation: one(participations, {
    fields: [participationProofs.participationId],
    references: [participations.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertProctorSchema = createInsertSchema(proctors).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, postedBy: true });
export const insertParticipationSchema = createInsertSchema(participations).omit({ 
  id: true, 
  submittedAt: true, 
  reviewedBy: true, 
  proctorFeedback: true,
  status: true,
  studentId: true 
});
export const insertProofSchema = createInsertSchema(participationProofs).omit({ id: true, uploadedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });


// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Proctor = typeof proctors.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Participation = typeof participations.$inferSelect;
export type ParticipationProof = typeof participationProofs.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertProctor = z.infer<typeof insertProctorSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertParticipation = z.infer<typeof insertParticipationSchema>;
export type InsertProof = z.infer<typeof insertProofSchema>;

// Extended types for responses
export type StudentWithUser = Student & { user: User };
export type ProctorWithUser = Proctor & { user: User };
export type ParticipationWithDetails = Participation & { 
  student: StudentWithUser;
  event: Event | null;
  proofs: ParticipationProof[];
};
