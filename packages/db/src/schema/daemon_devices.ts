import { pgTable, uuid, text, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Registered Clipboard daemon devices — one row per machine/process that
 * has called POST /api/daemon/register. Used by the poll/run-update
 * endpoints to authenticate the device (via deviceKey) and eventually
 * to route per-agent task assignments (future work).
 */
export const daemonDevices = pgTable(
  "daemon_devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deviceKey: text("device_key").notNull(),
    deviceName: text("device_name").notNull(),
    os: text("os").notNull(),
    availableClis: jsonb("available_clis").notNull().$type<string[]>(),
    version: text("version"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    deviceKeyUniqueIdx: uniqueIndex("daemon_devices_device_key_unique_idx").on(table.deviceKey),
  }),
);
