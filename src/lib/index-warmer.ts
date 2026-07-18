import dbConnect from "@/lib/db";
import User from "@/models/User";
import Team from "@/models/Team";
import Deal from "@/models/Deal";
import TeamMessage from "@/models/TeamMessage";
import Lead from "@/models/Lead";
import Notification from "@/models/Notification";
import EventSnapshot from "@/models/EventSnapshot";

/**
 * Unique Trick: Index Warmup Manager
 * Pre-warms and builds all background MongoDB indexes at server startup
 * so production queries never pay index creation overhead on first hit.
 */
export async function warmDatabaseIndexes(): Promise<{ success: boolean; timeMs: number }> {
  const start = Date.now();
  try {
    await dbConnect();
    await Promise.all([
      User.createIndexes(),
      Team.createIndexes(),
      Deal.createIndexes(),
      TeamMessage.createIndexes(),
      Lead.createIndexes(),
      Notification.createIndexes(),
      EventSnapshot.createIndexes(),
    ]);
    const timeMs = Date.now() - start;
    console.log(`[GWD Index Warmer] ✅ All MongoDB indexes pre-warmed in ${timeMs}ms`);
    return { success: true, timeMs };
  } catch (err: any) {
    console.error("[GWD Index Warmer] ❌ Index pre-warm warning:", err?.message);
    return { success: false, timeMs: Date.now() - start };
  }
}
