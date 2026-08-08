CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inactive',
  plan text NOT NULL DEFAULT 'mensal',
  price_cents integer NOT NULL DEFAULT 1500,
  currency text NOT NULL DEFAULT 'BRL',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
ON public.subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  extractions_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.usage_counters TO authenticated;
GRANT ALL ON public.usage_counters TO service_role;

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage"
ON public.usage_counters FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER usage_counters_updated_at
BEFORE UPDATE ON public.usage_counters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND status IN ('active', 'trialing')
      AND (current_period_end IS NULL OR current_period_end > now())
  )
$$;