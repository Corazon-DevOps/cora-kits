// Entitlement checks for extractions — server-only.
import { getAdmin } from "./supabase-admin.server";

export const FREE_EXTRACTIONS = 1;

export type Entitlement = {
  subscribed: boolean;
  extractionsUsed: number;
  freeLimit: number;
  canExtract: boolean;
  currentPeriodEnd: string | null;
};

export async function getEntitlementFor(userId: string): Promise<Entitlement> {
  const admin = getAdmin();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const periodEnd = (sub as any)?.current_period_end ?? null;
  const subscribed =
    !!sub &&
    ["active", "trialing"].includes((sub as any).status) &&
    (!periodEnd || new Date(periodEnd).getTime() > Date.now());

  const { data: usage } = await admin
    .from("usage_counters")
    .select("extractions_used")
    .eq("user_id", userId)
    .maybeSingle();

  const extractionsUsed = (usage as any)?.extractions_used ?? 0;

  return {
    subscribed,
    extractionsUsed,
    freeLimit: FREE_EXTRACTIONS,
    canExtract: subscribed || extractionsUsed < FREE_EXTRACTIONS,
    currentPeriodEnd: periodEnd,
  };
}

export async function consumeExtraction(userId: string): Promise<void> {
  const admin = getAdmin();
  const { data: existing } = await admin
    .from("usage_counters")
    .select("id, extractions_used")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    await admin.from("usage_counters").insert({ user_id: userId, extractions_used: 1 });
    return;
  }
  await admin
    .from("usage_counters")
    .update({ extractions_used: ((existing as any).extractions_used ?? 0) + 1 })
    .eq("id", (existing as any).id);
}
