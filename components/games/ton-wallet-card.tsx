"use client";

import { AlertCircle, ShieldCheck, Wallet } from "lucide-react";
import { TonConnectButton, useTonAddress, useTonWallet } from "@tonconnect/ui-react";
import { useTonWalletBalance } from "@/app/hooks/useTonWalletBalance";

export function TonWalletCard({ requiredTon }: { requiredTon: number }) {
  const wallet = useTonWallet();
  const address = useTonAddress(true);
  const { balance, loading, error } = useTonWalletBalance(address);

  return (
    <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55">
            <Wallet className="h-4 w-4" />
            TON Wallet
          </div>
          <div className="mt-2 text-xl font-extrabold text-white">
            {wallet ? wallet.device.appName : "Connect wallet to pay for cases"}
          </div>
          <div className="mt-2 text-sm text-white/70">
            {address
              ? `${address.slice(0, 6)}...${address.slice(-6)}`
              : "Use Tonkeeper or another TON wallet through TON Connect"}
          </div>
        </div>

        <TonConnectButton className="shrink-0" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.35rem] border border-white/10 bg-[#111b31] px-4 py-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Balance</div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {loading ? "Loading..." : balance ? `${balance.balanceTon} TON` : "Not loaded"}
          </div>
          <div className="mt-1 text-sm text-white/55">
            {balance ? `Network: ${balance.network}` : "Wallet balance comes from the connected address"}
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-white/10 bg-[#111b31] px-4 py-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Case price</div>
          <div className="mt-2 text-2xl font-extrabold text-white">{requiredTon} TON</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-white/60">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Payment is verified on the backend before the case opens
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-[1.2rem] border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
