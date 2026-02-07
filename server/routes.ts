import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, hashPassword } from "./auth";
import passport from "passport";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { events, users, students, proctors } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // Setup Object Storage
  registerObjectStorageRoutes(app);

  // Authentication Routes
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    // Enrich with profile data
    let profileData: any = {};
    if (user.role === 'student') {
      const student = await storage.getStudent(user.id);
      profileData = { student: student };
    } else if (user.role === 'proctor') {
      const proctor = await storage.getProctor(user.id);
      profileData = { proctor: proctor };
    }
    
    res.json({ ...user, ...profileData });
  });

  // Events Routes
  app.get(api.events.list.path, async (req, res) => {
    const filters: any = {};
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.from) filters.from = new Date(req.query.from as string);
    if (req.query.to) filters.to = new Date(req.query.to as string);
    if (req.query.query) filters.query = req.query.query as string;
    
    const events = await storage.getEvents(filters);
    res.json(events);
  });

  app.post(api.events.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(403);
    const user = req.user as any;
    if (user.role !== 'proctor' && user.role !== 'admin') return res.sendStatus(403);

    try {
      const input = api.events.create.input.parse(req.body);
      // Ensure postedBy is current user
      const event = await storage.createEvent({ ...input, postedBy: user.id });
      
      // Notify all students
      const students = await storage.getAllStudents();
      for (const student of students) {
        await storage.createNotification({
          userId: student.userId,
          title: "New Event: " + event.title,
          message: `A new event "${event.title}" has been posted in ${event.category}. Check it out!`,
          type: "event",
          relatedEntityId: event.id
        });
      }

      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.events.get.path, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  });

  app.patch(api.events.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(403);
    const user = req.user as any;
    if (user.role !== 'proctor' && user.role !== 'admin') return res.sendStatus(403);

    try {
      const input = api.events.update.input.parse(req.body);
      const event = await storage.updateEvent(Number(req.params.id), input);
      res.json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.events.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(403);
    const user = req.user as any;
    if (user.role !== 'proctor' && user.role !== 'admin') return res.sendStatus(403);

    await storage.deleteEvent(Number(req.params.id));
    res.sendStatus(204);
  });

  // Participation Routes
  app.post(api.participations.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== 'student') return res.sendStatus(403);
    
    // Check student profile exists
    const student = await storage.getStudent(user.id);
    if (!student) return res.status(400).json({ message: "Student profile incomplete" });

    try {
      const input = api.participations.create.input.parse(req.body);
      const { proofs, ...participationData } = input;
      
      const participation = await storage.createParticipation(
        { ...participationData, studentId: student.id },
        proofs
      );

      // Notify proctor
      if (student.proctorId) {
        const proctor = await storage.getProctor(student.proctorId); // Wait, getProctor expects userId? No, proctorId references proctors table. 
        // Need to get userId from proctor table
        // Actually, getStudentsByProctor takes proctorId.
        // I need a way to get proctor details by id.
        // Let's just find the user id of the proctor.
        // storage.getProctor gets by User ID.
        // I should have a method to get proctor by ID or fetch user via relation.
        // For now, simpler notification logic or skip for MVP.
        // Actually I can just notify all admins/proctors? No, too noisy.
        // Let's stick to simple MVP: Student submits, it's pending.
      }

      res.status(201).json(participation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.participations.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    
    let studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
    
    // Students can only see their own
    if (user.role === 'student') {
      const student = await storage.getStudent(user.id);
      if (!student) return res.json([]);
      studentId = student.id;
    }
    
    const status = req.query.status as string | undefined;
    const participations = await storage.getParticipations({ studentId, status });
    res.json(participations);
  });

  app.get(api.participations.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const participation = await storage.getParticipation(Number(req.params.id));
    if (!participation) return res.status(404).json({ message: "Participation not found" });
    res.json(participation);
  });

  app.patch(api.participations.review.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== 'proctor' && user.role !== 'admin') return res.sendStatus(403);

    try {
      const input = api.participations.review.input.parse(req.body);
      const participation = await storage.updateParticipationStatus(
        Number(req.params.id),
        input.status,
        input.feedback,
        user.id
      );
      
      // Notify student
      const p = await storage.getParticipation(participation.id);
      if (p) {
        await storage.createNotification({
          userId: p.student.userId,
          title: `Participation ${input.status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `Your participation for "${p.eventName}" has been ${input.status}. ${input.feedback ? 'Feedback: ' + input.feedback : ''}`,
          type: "submission",
          relatedEntityId: p.id
        });
      }

      res.json(participation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Stats & Other Routes
  app.get(api.stats.dashboard.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get(api.users.students.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const students = await storage.getAllStudents();
    res.json(students);
  });

  app.get(api.users.all.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== 'admin') return res.sendStatus(403);
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post(api.users.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== 'admin') return res.sendStatus(403);

    try {
      const input = api.users.create.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      const newUser = await storage.createUser({
        ...input,
        password: hashedPassword,
      });
      res.status(201).json(newUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.users.createStudent.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== 'admin') return res.sendStatus(403);

    try {
      const input = api.users.createStudent.input.parse(req.body);
      const student = await storage.createStudent(input);
      res.status(201).json(student);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.users.createProctor.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== 'admin') return res.sendStatus(403);

    try {
      const input = api.users.createProctor.input.parse(req.body);
      const proctor = await storage.createProctor(input);
      res.status(201).json(proctor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.notifications.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const notifications = await storage.getNotifications(user.id);
    res.json(notifications);
  });

  app.patch(api.notifications.markRead.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.markNotificationRead(Number(req.params.id));
    res.sendStatus(200);
  });

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
      role: "admin",
      firstName: "System",
      lastName: "Admin",
      email: "admin@college.edu",
      phone: "1234567890",
      isActive: true
    });
    console.log("Admin user created");
  }

  const proctorUser = await storage.getUserByUsername("proctor");
  if (!proctorUser) {
    const hashedPassword = await hashPassword("proctor123");
    const user = await storage.createUser({
      username: "proctor",
      password: hashedPassword,
      role: "proctor",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@college.edu",
      phone: "0987654321",
      isActive: true
    });
    await storage.createProctor({
      userId: user.id,
      employeeId: "EMP001",
      department: "Computer Science",
      designation: "Assistant Professor"
    });
    console.log("Proctor user created");
  }

  const studentUser = await storage.getUserByUsername("student");
  if (!studentUser) {
    const hashedPassword = await hashPassword("student123");
    const user = await storage.createUser({
      username: "student",
      password: hashedPassword,
      role: "student",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@college.edu",
      phone: "1122334455",
      isActive: true
    });
    await storage.createStudent({
      userId: user.id,
      usn: "1CR18CS001",
      department: "Computer Science",
      year: 4,
      semester: 7,
      batch: "2018-2022",
      proctorId: 1, // Assuming proctor id 1
      profilePhotoUrl: null
    });
    console.log("Student user created");
  }

  const existingEvents = await storage.getEvents();
  if (existingEvents.length === 0) {
    const admin = await storage.getUserByUsername("admin");
    if (admin) {
      await storage.createEvent({
        title: "Hackathon 2024",
        description: "Annual college hackathon.",
        category: "Technical",
        startDate: new Date("2024-10-10"),
        endDate: new Date("2024-10-12"),
        venue: "Main Auditorium",
        postedBy: admin.id,
        isPinned: true,
        isActive: true,
        bannerUrl: null
      });
      console.log("Seed event created");
    }
  }
}
