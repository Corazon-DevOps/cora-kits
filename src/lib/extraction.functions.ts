import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ExtractKitInputSchema,
  GenerateSampleCopyInputSchema,
  HarvestMoreAssetsInputSchema,
  extractKitImpl,
  generateSampleCopyImpl,
  harvestMoreAssetsImpl,
} from "@/server/extraction.server";
import { consumeExtraction, getEntitlementFor } from "@/server/entitlements.server";

export const extractKit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ExtractKitInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const entitlement = await getEntitlementFor(context.userId);
    if (!entitlement.canExtract) {
      return {
        ok: false as const,
        error:
          "Sua extração gratuita já foi usada. Assine o plano de R$ 15/mês para extrair sem limites.",
        requiresSubscription: true as const,
      };
    }
    const result = await extractKitImpl(data);
    if ((result as any)?.ok) await consumeExtraction(context.userId);
    return result;
  });

export const generateSampleCopy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => GenerateSampleCopyInputSchema.parse(data))
  .handler(async ({ data }) => generateSampleCopyImpl(data));

export const harvestMoreAssets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => HarvestMoreAssetsInputSchema.parse(data))
  .handler(async ({ data }) => harvestMoreAssetsImpl(data));
