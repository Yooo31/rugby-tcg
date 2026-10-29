"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { GameGate } from "@/features/game";
import { VIP_DATE_FORMAT } from "../lib/format";
import { VipBadge } from "./VipBadge";

/** Statut VIP, sur la page Compte, avec un lien vers le pass. */
export function VipSettings() {
  return (
    <GameGate fallback={<div className="skeleton h-12" />}>
      {({ vip }) => (
        <Link
          href="/vip"
          className="border-line hover:border-line-strong rounded-control flex min-h-12 items-center justify-between gap-3 border px-4 text-sm font-medium transition"
        >
          <span className="flex min-w-0 items-center gap-2">
            {vip.isActive ? <VipBadge /> : null}
            <span className="truncate">
              {vip.isActive && vip.until !== null
                ? `Jusqu'au ${VIP_DATE_FORMAT.format(vip.until)}`
                : "Découvrir le pass VIP"}
            </span>
          </span>
          <ChevronRight aria-hidden className="text-chalk-faint size-5" />
        </Link>
      )}
    </GameGate>
  );
}
