-- ============================================================
-- TIPHUB — Full Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.tipsters (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT DEFAULT '',
  photo TEXT DEFAULT '',
  sport TEXT NOT NULL DEFAULT 'Football',
  prix_abonnement NUMERIC(10,2) NOT NULL DEFAULT 29.99,
  payment_connected BOOLEAN NOT NULL DEFAULT FALSE,
  join_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.abonnes (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nom TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipster_id UUID NOT NULL REFERENCES public.tipsters(id) ON DELETE CASCADE,
  abonne_id UUID NOT NULL REFERENCES public.abonnes(id) ON DELETE CASCADE,
  statut TEXT NOT NULL DEFAULT 'pending' CHECK (statut IN ('pending', 'active', 'expired')),
  duree_jours INTEGER NOT NULL DEFAULT 30,
  date_activation TIMESTAMPTZ,
  date_expiration TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipster_id UUID NOT NULL REFERENCES public.tipsters(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  match TEXT NOT NULL,
  cote NUMERIC(5,2) NOT NULL,
  mise INTEGER NOT NULL DEFAULT 1 CHECK (mise BETWEEN 1 AND 5),
  analyse TEXT DEFAULT '',
  statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'win', 'loss', 'nul')),
  date_match TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_subscriptions_tipster ON public.subscriptions(tipster_id);
CREATE INDEX idx_subscriptions_abonne ON public.subscriptions(abonne_id);
CREATE INDEX idx_subscriptions_statut ON public.subscriptions(statut);
CREATE INDEX idx_picks_tipster ON public.picks(tipster_id);
CREATE INDEX idx_picks_statut ON public.picks(statut);
CREATE INDEX idx_picks_created ON public.picks(created_at DESC);
CREATE INDEX idx_tipsters_sport ON public.tipsters(sport);
CREATE INDEX idx_tipsters_username ON public.tipsters(username);
CREATE INDEX idx_tipsters_join_code ON public.tipsters(join_code);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.tipsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- TIPSTERS
CREATE POLICY "tipsters_select_public" ON public.tipsters FOR SELECT USING (true);
CREATE POLICY "tipsters_insert_own" ON public.tipsters FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "tipsters_update_own" ON public.tipsters FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "tipsters_update_admin" ON public.tipsters FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "tipsters_delete_admin" ON public.tipsters FOR DELETE USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- ABONNÉS
CREATE POLICY "abonnes_select_own" ON public.abonnes FOR SELECT USING (auth.uid() = id);
CREATE POLICY "abonnes_insert_own" ON public.abonnes FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "abonnes_update_own" ON public.abonnes FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "abonnes_select_by_tipster" ON public.abonnes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.abonne_id = abonnes.id AND s.tipster_id = auth.uid())
);
CREATE POLICY "abonnes_select_admin" ON public.abonnes FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- SUBSCRIPTIONS
CREATE POLICY "subscriptions_select_abonne" ON public.subscriptions FOR SELECT USING (auth.uid() = abonne_id);
CREATE POLICY "subscriptions_select_tipster" ON public.subscriptions FOR SELECT USING (auth.uid() = tipster_id);
CREATE POLICY "subscriptions_insert_abonne" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = abonne_id);
CREATE POLICY "subscriptions_update_tipster" ON public.subscriptions FOR UPDATE USING (auth.uid() = tipster_id) WITH CHECK (auth.uid() = tipster_id);
CREATE POLICY "subscriptions_update_abonne" ON public.subscriptions FOR UPDATE USING (auth.uid() = abonne_id) WITH CHECK (auth.uid() = abonne_id);
CREATE POLICY "subscriptions_select_admin" ON public.subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- PICKS
CREATE POLICY "picks_all_tipster" ON public.picks FOR ALL USING (auth.uid() = tipster_id) WITH CHECK (auth.uid() = tipster_id);
CREATE POLICY "picks_select_subscriber" ON public.picks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.tipster_id = picks.tipster_id
      AND s.abonne_id = auth.uid()
      AND s.statut = 'active'
      AND (s.date_expiration IS NULL OR s.date_expiration > NOW())
  )
);
CREATE POLICY "picks_select_admin" ON public.picks FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- NOTIFICATIONS
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ADMINS
CREATE POLICY "admins_select_own" ON public.admins FOR SELECT USING (auth.uid() = id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_tipsters BEFORE UPDATE ON public.tipsters FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_abonnes BEFORE UPDATE ON public.abonnes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_subscriptions BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_picks BEFORE UPDATE ON public.picks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-expire subscriptions
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS INTEGER AS $$
DECLARE expired_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE public.subscriptions
    SET statut = 'expired', updated_at = NOW()
    WHERE statut = 'active'
      AND date_expiration IS NOT NULL
      AND date_expiration < NOW()
    RETURNING id, abonne_id, tipster_id
  )
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  SELECT
    e.abonne_id,
    'subscription_expired',
    'Abonnement expiré',
    'Votre abonnement a expiré. Contactez votre tipster pour le renouveler.',
    jsonb_build_object('tipster_id', e.tipster_id, 'subscription_id', e.id)
  FROM expired e;

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify tipster on new subscriber
CREATE OR REPLACE FUNCTION public.notify_new_subscriber()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.tipster_id,
    'new_subscriber',
    'Nouvel abonné en attente',
    'Un nouvel abonné attend votre activation.',
    jsonb_build_object('subscription_id', NEW.id, 'abonne_id', NEW.abonne_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_subscription
  AFTER INSERT ON public.subscriptions
  FOR EACH ROW
  WHEN (NEW.statut = 'pending')
  EXECUTE FUNCTION public.notify_new_subscriber();

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.picks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- CRON (enable pg_cron in Supabase Dashboard > Extensions)
-- SELECT cron.schedule('expire-subs', '*/15 * * * *', 'SELECT public.expire_subscriptions()');
-- ============================================================
