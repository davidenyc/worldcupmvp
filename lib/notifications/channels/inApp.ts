import "server-only";

interface InAppInput {
  kind: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
}

export async function writeInApp(_profileId: string, _input: InAppInput) {
  // Implemented in the next commit with Prisma-backed notification writes.
}
