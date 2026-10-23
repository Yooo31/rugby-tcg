import "server-only";
import { ShareButton } from "@/components/ui/share-button";
import { referralData } from "@/data/server";
import {
  MAX_REWARDED_REFERRALS,
  REFERRAL_ACTIVE_DAYS,
  REFERRAL_WELCOME_BOOSTERS,
  REFERRER_REWARD_BOOSTERS,
} from "@/domain";
import { getAuthUser } from "@/features/auth/server";
import { SIGN_UP_PATH } from "@/lib/supabase/routes";

const plural = (count: number) => (count > 1 ? "s" : "");

/** Code de parrainage du joueur, lien à partager et suivi des filleuls. */
export async function ReferralPanel() {
  const user = await getAuthUser();
  if (!user) return null;
  const summary = await referralData.summary(user.id);
  const site = process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000";
  const link = `${site}${SIGN_UP_PATH}?parrain=${summary.code}`;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-4xl font-bold tracking-widest">
        {summary.code}
      </p>
      <p className="text-chalk-muted text-sm text-pretty">
        Votre filleul reçoit {REFERRAL_WELCOME_BOOSTERS} booster
        {plural(REFERRAL_WELCOME_BOOSTERS)} à l&apos;inscription. Vous en
        recevez {REFERRER_REWARD_BOOSTERS} quand il a ouvert des boosters{" "}
        {REFERRAL_ACTIVE_DAYS} jours différents ({MAX_REWARDED_REFERRALS}{" "}
        filleuls récompensés au plus).
      </p>
      <p className="text-sm tabular-nums">
        {summary.referred} filleul{plural(summary.referred)} inscrit
        {plural(summary.referred)}, dont {summary.active} actif
        {plural(summary.active)}.
      </p>
      <ShareButton
        title="Rugby TCG"
        text={`Collectionne les clubs de rugby français avec moi ! Code ${summary.code} : un booster offert.`}
        url={link}
        label="Inviter un ami"
      />
    </div>
  );
}
