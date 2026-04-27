import type { Request, Response } from "express";

export type RealtimeEntity =
  | "menu-items"
  | "offers"
  | "orders"
  | "customers"
  | "billing"
  | "dashboard";

type RealtimeMessage = {
  id: string;
  type: "connected" | "invalidate";
  entities: RealtimeEntity[];
  timestamp: string;
};

const clients = new Set<Response>();

const writeEvent = (res: Response, event: string, payload: RealtimeMessage) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const createMessage = (
  type: RealtimeMessage["type"],
  entities: RealtimeEntity[]
): RealtimeMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  type,
  entities,
  timestamp: new Date().toISOString(),
});

export const streamRealtimeEvents = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  clients.add(res);
  res.write("retry: 3000\n\n");
  writeEvent(res, "connected", createMessage("connected", []));

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(res);
    res.end();
  });
};

export const broadcastInvalidation = (entities: RealtimeEntity[]) => {
  if (entities.length === 0) return;

  const uniqueEntities = [...new Set(entities)];
  const payload = createMessage("invalidate", uniqueEntities);

  clients.forEach((client) => {
    writeEvent(client, "invalidate", payload);
  });
};
