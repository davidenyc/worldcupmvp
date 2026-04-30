import "server-only";

import { prisma } from "@/lib/prisma";

interface InAppInput {
  kind: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  href?: string;
}

export async function writeInApp(profileId: string, input: InAppInput) {
  await prisma.notification.create({
    data: {
      profileId,
      kind: input.kind,
      title: input.title,
      body: input.body,
      payload: {
        ...input.payload,
        href: input.href ?? null
      },
      channels: ["in_app"],
      sentAt: new Date()
    }
  });
}
