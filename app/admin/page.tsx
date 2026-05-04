"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  Bot,
  Loader2,
  PackageSearch,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import {
  adjustAdminUserBalance,
  fetchAdminBalanceTransactions,
  fetchAdminOverview,
  fetchAdminPurchaseRequests,
  fetchAdminStatus,
  fetchAdminUsers,
  fetchAdminWithdrawals,
  markAdminPurchaseDelivered,
  markAdminPurchaseFailed,
  markAdminPurchaseFound,
  markAdminPurchasePurchased,
  searchAdminPurchaseRequest,
} from "@/app/lib/admin-api";
import type {
  AdminBalanceTransaction,
  AdminOverviewPayload,
  AdminPurchaseRequest,
  AdminUser,
  AdminWithdrawal,
} from "@/app/lib/admin";

export default function AdminPage() {
  const { loading: authLoading, error: authError } = useTelegramAuth();
  const [overview, setOverview] = useState<AdminOverviewPayload | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminBalanceTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<AdminPurchaseRequest[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const providers = overview?.providers ?? [];
  const providerLabel = useMemo(
    () => providers.find((provider) => provider.key === "manual")?.label ?? "Manual Review",
    [providers]
  );

  const refreshData = async () => {
    const [status, overviewPayload, usersPayload, txPayload, withdrawalsPayload, purchases] =
      await Promise.all([
        fetchAdminStatus(),
        fetchAdminOverview(),
        fetchAdminUsers(),
        fetchAdminBalanceTransactions(),
        fetchAdminWithdrawals(),
        fetchAdminPurchaseRequests(),
      ]);

    setIsAdmin(status.isAdmin);
    setOverview(overviewPayload);
    setUsers(usersPayload);
    setTransactions(txPayload);
    setWithdrawals(withdrawalsPayload);
    setPurchaseRequests(purchases);
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setPageLoading(true);

      try {
        await refreshData();

        if (!cancelled) {
          setPageError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(error instanceof Error ? error.message : "Failed to load admin panel");
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  const runPurchaseAction = async (requestId: string, action: () => Promise<unknown>) => {
    setActionLoadingId(requestId);

    try {
      await action();
      await refreshData();
      setPageError(null);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Admin action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBalanceAdjust = async (user: AdminUser) => {
    const amountRaw = window.prompt(
      `Adjust balance for ${formatUserLabel(user)}.\nUse positive or negative TON amount:`,
      "10"
    );

    if (!amountRaw) {
      return;
    }

    const amountTon = Number(amountRaw);

    if (!Number.isFinite(amountTon) || !Number.isInteger(amountTon) || amountTon === 0) {
      setPageError("Balance adjustment must be a non-zero integer TON amount");
      return;
    }

    const note = window.prompt("Optional note for audit log:", "Admin adjustment") ?? undefined;

    setActionLoadingId(user.id);

    try {
      await adjustAdminUserBalance(user.id, amountTon, note);
      await refreshData();
      setPageError(null);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to adjust balance");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (pageLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6 text-white">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </main>
    );
  }

  const isAccessDenied = !!pageError && !isAdmin;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6 text-white">
      <div className="mb-6 flex items-center gap-4 border-b border-white/20 pb-5">
        <Link
          href="/profile"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      {authError && (
        <div className="mb-4 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
          Auth warning: {authError}
        </div>
      )}

      {pageError && (
        <div className="mb-4 rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-900">
          {pageError}
        </div>
      )}

      {isAccessDenied ? (
        <div className="rounded-3xl bg-white px-5 py-6 text-center text-black">
          This account is not in ADMIN_TELEGRAM_IDS.
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Users className="h-5 w-5 text-sky-100" />}
              title="Users"
              value={String(overview?.stats.totalUsers ?? 0)}
              subtitle="registered"
              gradient="linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)"
            />
            <StatCard
              icon={<Wallet className="h-5 w-5 text-emerald-100" />}
              title="Balance Pool"
              value={`${overview?.stats.totalInternalBalanceTon ?? 0} TON`}
              subtitle="all internal balances"
              gradient="linear-gradient(135deg, #10b981 0%, #22c55e 100%)"
            />
            <StatCard
              icon={<PackageSearch className="h-5 w-5 text-amber-100" />}
              title="Withdrawals"
              value={String(overview?.stats.pendingWithdrawals ?? 0)}
              subtitle="waiting"
              gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
            />
            <StatCard
              icon={<ShieldCheck className="h-5 w-5 text-fuchsia-100" />}
              title="Open CoinFlip"
              value={String(overview?.stats.openCoinflipRooms ?? 0)}
              subtitle="active rooms"
              gradient="linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
            />
          </section>

          <section className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-5 text-sm text-cyan-50">
            <div className="font-bold text-cyan-100">Purchase automation status</div>
            <div className="mt-2 leading-6 text-cyan-50/90">
              Withdraw requests automatically create purchase-queue tasks. The provider layer is
              ready for marketplace integrations, and right now the manual provider gives us a safe
              fallback until we connect exact gift sites and bot delivery flows.
            </div>
          </section>

          <section className="mt-8">
            <SectionTitle icon={<Bot className="h-4 w-4" />} title="Purchase Queue" />
            <div className="mt-3 space-y-3">
              {purchaseRequests.length === 0 ? (
                <EmptyCard text="No purchase requests yet." />
              ) : (
                purchaseRequests.map((request) => (
                  <div key={request.id} className="rounded-3xl border border-white/10 bg-white/8 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                        <Image
                          src={request.giftType.image}
                          alt={request.giftType.name}
                          width={56}
                          height={56}
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-extrabold">{request.giftType.name}</div>
                        <div className="text-sm text-white/65">
                          {formatUserLabel(request.user)} · {request.status}
                        </div>
                        <div className="mt-1 text-xs text-white/45">Query: {request.searchQuery}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold text-emerald-300">
                          {request.giftType.estimatedValueTon} TON
                        </div>
                        <div className="text-white/50">{request.providerLabel ?? "Not chosen"}</div>
                      </div>
                    </div>

                    {(request.externalListingUrl || request.externalOrderId || request.failureReason) && (
                      <div className="mt-3 rounded-2xl bg-black/15 px-3 py-3 text-sm text-white/75">
                        {request.externalListingUrl && <div>Listing: {request.externalListingUrl}</div>}
                        {request.externalOrderId && <div>Order: {request.externalOrderId}</div>}
                        {request.failureReason && <div>Failure: {request.failureReason}</div>}
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <ActionButton
                        label={actionLoadingId === request.id ? "Searching..." : "Search"}
                        disabled={actionLoadingId === request.id}
                        onClick={() =>
                          void runPurchaseAction(request.id, () => searchAdminPurchaseRequest(request.id))
                        }
                      />
                      <ActionButton
                        label="Mark Found"
                        disabled={actionLoadingId === request.id}
                        onClick={() => {
                          const listingUrl = window.prompt("Listing URL:", request.externalListingUrl ?? "");
                          const priceRaw = window.prompt(
                            "Quoted price TON:",
                            request.quotedPriceTon?.toString() ?? ""
                          );
                          const quotedPriceTon =
                            priceRaw && priceRaw.trim() !== "" ? Number(priceRaw) : undefined;

                          void runPurchaseAction(request.id, () =>
                            markAdminPurchaseFound({
                              requestId: request.id,
                              providerKey: request.providerKey ?? "manual",
                              providerLabel: request.providerLabel ?? providerLabel,
                              externalListingUrl: listingUrl || undefined,
                              quotedPriceTon:
                                quotedPriceTon !== undefined && Number.isFinite(quotedPriceTon)
                                  ? quotedPriceTon
                                  : undefined,
                            })
                          );
                        }}
                      />
                      <ActionButton
                        label="Purchased"
                        disabled={actionLoadingId === request.id}
                        onClick={() => {
                          const orderId = window.prompt("External order ID:", request.externalOrderId ?? "");
                          const priceRaw = window.prompt(
                            "Purchased price TON:",
                            request.purchasedPriceTon?.toString() ??
                              request.quotedPriceTon?.toString() ??
                              ""
                          );
                          const purchasedPriceTon =
                            priceRaw && priceRaw.trim() !== "" ? Number(priceRaw) : undefined;

                          void runPurchaseAction(request.id, () =>
                            markAdminPurchasePurchased({
                              requestId: request.id,
                              externalOrderId: orderId || undefined,
                              purchasedPriceTon:
                                purchasedPriceTon !== undefined && Number.isFinite(purchasedPriceTon)
                                  ? purchasedPriceTon
                                  : undefined,
                            })
                          );
                        }}
                      />
                      <ActionButton
                        label="Delivered"
                        disabled={actionLoadingId === request.id}
                        onClick={() => {
                          const telegramGiftId = window.prompt(
                            "Telegram delivery gift ID (optional):",
                            request.deliveryTelegramGiftId ?? ""
                          );

                          void runPurchaseAction(request.id, () =>
                            markAdminPurchaseDelivered({
                              requestId: request.id,
                              deliveryTelegramGiftId: telegramGiftId || undefined,
                            })
                          );
                        }}
                      />
                      <ActionButton
                        label="Fail"
                        disabled={actionLoadingId === request.id}
                        className="col-span-2"
                        onClick={() => {
                          const reason = window.prompt("Failure reason:", request.failureReason ?? "");

                          if (!reason) {
                            return;
                          }

                          void runPurchaseAction(request.id, () =>
                            markAdminPurchaseFailed({
                              requestId: request.id,
                              reason,
                            })
                          );
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-8">
            <SectionTitle icon={<PackageSearch className="h-4 w-4" />} title="Pending Withdrawals" />
            <div className="mt-3 space-y-3">
              {withdrawals.length === 0 ? (
                <EmptyCard text="No pending withdrawals." />
              ) : (
                withdrawals.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-white/8 p-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.giftType.image}
                        alt={item.giftType.name}
                        width={54}
                        height={54}
                        className="h-12 w-12 rounded-2xl bg-white/10 p-1 object-contain"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-extrabold">{item.giftType.name}</div>
                        <div className="text-sm text-white/65">
                          {item.user ? formatUserLabel(item.user) : "Unknown user"}
                        </div>
                      </div>
                      <div className="text-right text-sm text-white/70">
                        <div>{item.giftType.estimatedValueTon} TON</div>
                        <div>{item.purchaseStatus ?? "no queue"}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-8">
            <SectionTitle icon={<BadgeDollarSign className="h-4 w-4" />} title="Users" />
            <div className="mt-3 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="rounded-3xl border border-white/10 bg-white/8 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-extrabold">{formatUserLabel(user)}</div>
                      <div className="text-sm text-white/65">Balance: {user.balanceTon} TON</div>
                      <div className="text-xs text-white/45">Items: {user.inventoryCount}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleBalanceAdjust(user)}
                      disabled={actionLoadingId === user.id}
                      className="rounded-2xl bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-100 disabled:opacity-60"
                    >
                      {actionLoadingId === user.id ? "..." : "Adjust"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <SectionTitle icon={<Wallet className="h-4 w-4" />} title="Recent Balance Transactions" />
            <div className="mt-3 space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="rounded-3xl border border-white/10 bg-white/8 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-base font-extrabold">{formatUserLabel(tx.user)}</div>
                      <div className="text-sm text-white/65">
                        {tx.type} · after {tx.balanceAfterTon} TON
                      </div>
                      {tx.note && <div className="text-xs text-white/45">{tx.note}</div>}
                    </div>
                    <div
                      className={`text-base font-extrabold ${
                        tx.amountTon >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {tx.amountTon > 0 ? "+" : ""}
                      {tx.amountTon} TON
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 pb-8">
            <SectionTitle icon={<ShieldCheck className="h-4 w-4" />} title="Recent Audit Log" />
            <div className="mt-3 space-y-3">
              {overview?.recentAuditLogs.length ? (
                overview.recentAuditLogs.map((log) => (
                  <div key={log.id} className="rounded-3xl border border-white/10 bg-white/8 p-4">
                    <div className="text-sm font-extrabold text-white">{log.action}</div>
                    <div className="mt-1 text-sm text-white/65">
                      {log.entityType}
                      {log.entityId ? ` · ${log.entityId}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyCard text="Audit log is still empty." />
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-white/65">
      {icon}
      {title}
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  gradient,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div
      className="rounded-3xl px-4 py-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
      style={{ backgroundImage: gradient }}
    >
      <div className="flex items-center gap-2 text-sm text-white/80">
        {icon}
        {title}
      </div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm text-white/80">{subtitle}</div>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/8 px-5 py-6 text-center text-white/75">
      {text}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white disabled:opacity-60 ${className ?? ""}`}
    >
      {label}
    </button>
  );
}

function formatUserLabel(user: {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
}) {
  if (user.username) {
    return `@${user.username}`;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || "User";
}
