import { z } from "zod";
import { 
  insertUserSchema, 
  insertEventSchema, 
  insertParticipationSchema,
  users,
  events,
  participations,
  students,
  proctors,
  notifications,
  participationProofs
} from "./schema";

// === SHARED ERROR SCHEMAS ===
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// === API CONTRACT ===
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect & { student?: typeof students.$inferSelect, proctor?: typeof proctors.$inferSelect }>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      input: z.object({
        category: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        query: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/events/:id' as const,
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/events/:id' as const,
      input: insertEventSchema.partial(),
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id' as const,
      responses: {
        204: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  participations: {
    create: {
      method: 'POST' as const,
      path: '/api/participations' as const,
      input: z.object({
        ...insertParticipationSchema.shape,
        proofs: z.array(z.object({
          fileName: z.string(),
          fileUrl: z.string(),
          fileType: z.string(),
          fileSize: z.number(),
        })),
      }),
      responses: {
        201: z.custom<typeof participations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/participations' as const,
      input: z.object({
        studentId: z.coerce.number().optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof participations.$inferSelect & { event: typeof events.$inferSelect | null, proofs: typeof participationProofs.$inferSelect[] }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/participations/:id' as const,
      responses: {
        200: z.custom<typeof participations.$inferSelect & { student: typeof students.$inferSelect & { user: typeof users.$inferSelect }, event: typeof events.$inferSelect | null, proofs: typeof participationProofs.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    review: {
      method: 'PATCH' as const,
      path: '/api/participations/:id/review' as const,
      input: z.object({
        status: z.enum(['approved', 'rejected']),
        feedback: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof participations.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  stats: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/stats/dashboard' as const,
      responses: {
        200: z.object({
          totalEvents: z.number(),
          totalParticipations: z.number(),
          pendingReviews: z.number(),
          approvedParticipations: z.number(),
          rejectedParticipations: z.number(),
        }),
      },
    },
  },
  users: {
    students: {
      method: 'GET' as const,
      path: '/api/proctor/students' as const,
      responses: {
        200: z.array(z.custom<typeof students.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    all: {
      method: 'GET' as const,
      path: '/api/admin/users' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/users' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    createStudent: {
      method: 'POST' as const,
      path: '/api/admin/students' as const,
      input: insertStudentSchema,
      responses: {
        201: z.custom<typeof students.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    createProctor: {
      method: 'POST' as const,
      path: '/api/admin/proctors' as const,
      input: insertProctorSchema,
      responses: {
        201: z.custom<typeof proctors.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  notifications: {
    list: {
      method: 'GET' as const,
      path: '/api/notifications' as const,
      responses: {
        200: z.array(z.custom<typeof notifications.$inferSelect>()),
      },
    },
    markRead: {
      method: 'PATCH' as const,
      path: '/api/notifications/:id/read' as const,
      responses: {
        200: z.void(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
