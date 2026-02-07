import { 
  users, students, proctors, events, participations, participationProofs, notifications,
  type User, type InsertUser, type Student, type InsertStudent, type Proctor, type InsertProctor,
  type Event, type InsertEvent, type Participation, type InsertParticipation, type ParticipationProof, type InsertProof,
  type Notification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Students & Proctors
  getStudent(userId: number): Promise<(Student & { user: User }) | undefined>;
  getStudentById(id: number): Promise<(Student & { user: User }) | undefined>;
  getProctor(userId: number): Promise<(Proctor & { user: User }) | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  createProctor(proctor: InsertProctor): Promise<Proctor>;
  getStudentsByProctor(proctorId: number): Promise<(Student & { user: User })[]>;
  getAllStudents(): Promise<(Student & { user: User })[]>;

  // Events
  getEvents(filters?: { category?: string, from?: Date, to?: Date, query?: string }): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Participations
  createParticipation(participation: InsertParticipation, proofs: { fileName: string, fileUrl: string, fileType: string, fileSize: number }[]): Promise<Participation>;
  getParticipations(filters?: { studentId?: number, status?: string }): Promise<(Participation & { event: Event | null, proofs: ParticipationProof[] })[]>;
  getParticipation(id: number): Promise<(Participation & { student: Student & { user: User }, event: Event | null, proofs: ParticipationProof[] }) | undefined>;
  updateParticipationStatus(id: number, status: string, feedback?: string, reviewerId?: number): Promise<Participation>;

  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: { userId: number, title: string, message: string, type: string, relatedEntityId?: number }): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;

  // Stats
  getStats(): Promise<{ totalEvents: number, totalParticipations: number, pendingReviews: number, approvedParticipations: number, rejectedParticipations: number }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Students & Proctors
  async getStudent(userId: number): Promise<(Student & { user: User }) | undefined> {
    const result = await db.select().from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.userId, userId));
    
    if (result.length === 0) return undefined;
    return { ...result[0].students, user: result[0].users };
  }

  async getStudentById(id: number): Promise<(Student & { user: User }) | undefined> {
    const result = await db.select().from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.id, id));
    
    if (result.length === 0) return undefined;
    return { ...result[0].students, user: result[0].users };
  }

  async getProctor(userId: number): Promise<(Proctor & { user: User }) | undefined> {
    const result = await db.select().from(proctors)
      .innerJoin(users, eq(proctors.userId, users.id))
      .where(eq(proctors.userId, userId));

    if (result.length === 0) return undefined;
    return { ...result[0].proctors, user: result[0].users };
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async createProctor(insertProctor: InsertProctor): Promise<Proctor> {
    const [proctor] = await db.insert(proctors).values(insertProctor).returning();
    return proctor;
  }

  async getStudentsByProctor(proctorId: number): Promise<(Student & { user: User })[]> {
    const result = await db.select().from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.proctorId, proctorId));
    
    return result.map(r => ({ ...r.students, user: r.users }));
  }

  async getAllStudents(): Promise<(Student & { user: User })[]> {
    const result = await db.select().from(students)
      .innerJoin(users, eq(students.userId, users.id));
    
    return result.map(r => ({ ...r.students, user: r.users }));
  }

  // Events
  async getEvents(filters?: { category?: string, from?: Date, to?: Date, query?: string }): Promise<Event[]> {
    let conditions = [];
    if (filters?.category) conditions.push(eq(events.category, filters.category));
    if (filters?.from) conditions.push(sql`${events.startDate} >= ${filters.from}`);
    if (filters?.to) conditions.push(sql`${events.endDate} <= ${filters.to}`);
    if (filters?.query) {
      conditions.push(or(
        like(events.title, `%${filters.query}%`),
        like(events.description, `%${filters.query}%`)
      ));
    }

    return await db.select().from(events)
      .where(and(...conditions))
      .orderBy(desc(events.startDate));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Participations
  async createParticipation(participation: InsertParticipation, proofs: { fileName: string, fileUrl: string, fileType: string, fileSize: number }[]): Promise<Participation> {
    return await db.transaction(async (tx) => {
      const [newParticipation] = await tx.insert(participations).values(participation).returning();
      
      if (proofs.length > 0) {
        await tx.insert(participationProofs).values(
          proofs.map(p => ({
            ...p,
            participationId: newParticipation.id,
          }))
        );
      }
      
      return newParticipation;
    });
  }

  async getParticipations(filters?: { studentId?: number, status?: string }): Promise<(Participation & { event: Event | null, proofs: ParticipationProof[] })[]> {
    let conditions = [];
    if (filters?.studentId) conditions.push(eq(participations.studentId, filters.studentId));
    if (filters?.status) conditions.push(eq(participations.status, filters.status));

    const result = await db.select().from(participations)
      .leftJoin(events, eq(participations.eventId, events.id))
      .where(and(...conditions))
      .orderBy(desc(participations.submittedAt));
    
    // This N+1 is bad but okay for lite build. Ideally use relations properly or join.
    // Drizzle relations query API is better here but I'll stick to manual join + separate query for proofs for simplicity of types
    const partsWithEvents = result.map(r => ({ ...r.participations, event: r.events }));
    
    const partsWithProofs = await Promise.all(partsWithEvents.map(async (p) => {
      const proofs = await db.select().from(participationProofs).where(eq(participationProofs.participationId, p.id));
      return { ...p, proofs };
    }));

    return partsWithProofs;
  }

  async getParticipation(id: number): Promise<(Participation & { student: Student & { user: User }, event: Event | null, proofs: ParticipationProof[] }) | undefined> {
    const result = await db.select().from(participations)
      .leftJoin(events, eq(participations.eventId, events.id))
      .innerJoin(students, eq(participations.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(participations.id, id));

    if (result.length === 0) return undefined;

    const proofs = await db.select().from(participationProofs).where(eq(participationProofs.participationId, id));
    
    return {
      ...result[0].participations,
      event: result[0].events,
      student: { ...result[0].students, user: result[0].users },
      proofs,
    };
  }

  async updateParticipationStatus(id: number, status: string, feedback?: string, reviewerId?: number): Promise<Participation> {
    const [participation] = await db.update(participations)
      .set({ 
        status: status as any, 
        proctorFeedback: feedback, 
        reviewedBy: reviewerId 
      })
      .where(eq(participations.id, id))
      .returning();
    return participation;
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: { userId: number, title: string, message: string, type: string, relatedEntityId?: number }): Promise<Notification> {
    const [n] = await db.insert(notifications).values(notification).returning();
    return n;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Stats
  async getStats(): Promise<{ totalEvents: number, totalParticipations: number, pendingReviews: number, approvedParticipations: number, rejectedParticipations: number }> {
    const [eventCount] = await db.select({ count: sql<number>`count(*)` }).from(events);
    const [partCount] = await db.select({ count: sql<number>`count(*)` }).from(participations);
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(participations).where(eq(participations.status, 'pending'));
    const [approvedCount] = await db.select({ count: sql<number>`count(*)` }).from(participations).where(eq(participations.status, 'approved'));
    const [rejectedCount] = await db.select({ count: sql<number>`count(*)` }).from(participations).where(eq(participations.status, 'rejected'));

    return {
      totalEvents: Number(eventCount.count),
      totalParticipations: Number(partCount.count),
      pendingReviews: Number(pendingCount.count),
      approvedParticipations: Number(approvedCount.count),
      rejectedParticipations: Number(rejectedCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
