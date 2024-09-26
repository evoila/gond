"use server";

import { and, eq } from "drizzle-orm";

import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/schemas";

export async function readAppointment(id: number) {
  const { user } = await validateRequest();

  if (!user) return;

  return await db.query.appointments.findFirst({
    where: and(
      user.role !== "responder"
        ? eq(appointments.requesterId, user.id)
        : undefined,
      eq(appointments.id, id),
    ),
    with: {
      requester: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
      comments: {
        columns: {
          created: true,
          message: true,
        },
        with: {
          creator: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      responder: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function readAppointments() {
  const { user } = await validateRequest();

  if (!user) return [];

  return await db.query.appointments.findMany({
    where:
      user.role !== "responder"
        ? eq(appointments.requesterId, user.id)
        : undefined,
    with: {
      requester: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
      responder: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}
