import { Env, json, readJson, withDb } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

interface WithdrawalRequest {
  uid?: string;
  amount?: number;
  bankDetails?: { bankName?: string; accountNumber?: string; accountName?: string };
  networkGasFee?: number;
}

const SYSTEM_FEE_RATE = 0.03;

function generateOrderId(): string {
  return `WD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;

    const body = await readJson<WithdrawalRequest>(context.request);
    const amount = Number(body.amount);
    const bankName = String(body.bankDetails?.bankName || "").trim();
    const accountNumber = String(body.bankDetails?.accountNumber || "").trim();
    const accountName = String(body.bankDetails?.accountName || "").trim();
    const networkGasFee = Math.max(0, Math.round(Number(body.networkGasFee || 0)));

    if (!Number.isInteger(amount) || amount < 100000) {
      return json({ success: false, error: "Minimum crypto withdrawal is Rp 100.000." }, 400);
    }
    if (!bankName || !accountNumber || !accountName) {
      return json({ success: false, error: "Data tujuan withdrawal wajib lengkap." }, 400);
    }

    const userId = Number(auth.user.id);
    const orderId = generateOrderId();
    const systemFee = Math.round(amount * SYSTEM_FEE_RATE);
    const totalFee = systemFee + networkGasFee;
    const netPayoutAmount = Math.max(0, amount - totalFee);

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");
      try {
        const userResult = await client.query(
          `
          SELECT id, email, username,
                 COALESCE(balance, 0) AS balance,
                 COALESCE(saldo, 0) AS saldo,
                 COALESCE("walletBalance", 0) AS "walletBalance"
          FROM users WHERE id = $1 FOR UPDATE
          `,
          [userId]
        );

        if (userResult.rows.length === 0) throw new Error("USER_NOT_FOUND");

        const user = userResult.rows[0];
        const availableBalance = Math.max(
          Number(user.balance || 0),
          Number(user.saldo || 0),
          Number(user.walletBalance || 0)
        );

        if (availableBalance < amount) throw new Error("INSUFFICIENT_BALANCE");

        // Reserve the gross amount immediately. Admin/Owner approval is still required.
        const remainingBalance = availableBalance - amount;

        await client.query(
          `
          UPDATE users
          SET balance = $1, saldo = $1, "walletBalance" = $1, updated_at = NOW()
          WHERE id = $2
          `,
          [remainingBalance, userId]
        );

        const orderResult = await client.query(
          `
          INSERT INTO subscription_orders (
            order_id, user_id, nama, jumlah, user_email, plan_id, plan_name,
            price, currency, status, payment_method, duration_days, type,
            fee_amount, net_payout_amount, user_name, bank_name,
            account_number, account_name, notes, created_at
          )
          VALUES (
            $1, $2, $3, $4, $5, 'crypto-withdrawal', 'Crypto Withdrawal',
            $4, 'IDR', 'pending', 'Crypto Withdrawal', 0, 'withdrawal',
            $6, $7, $3, $8, $9, $10,
            'Menunggu verifikasi dan approval Admin/Owner sebelum payout.',
            NOW()
          )
          RETURNING id, order_id AS "orderId", price, status,
                    fee_amount AS "feeAmount",
                    net_payout_amount AS "netPayoutAmount",
                    created_at AS "createdAt"
          `,
          [
            orderId, userId, user.username || user.email, amount, user.email,
            totalFee, netPayoutAmount, bankName, accountNumber, accountName
          ]
        );

        await client.query("COMMIT");
        return { withdrawal: orderResult.rows[0], remainingBalance };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      status: "pending",
      message: "Pengajuan withdrawal berhasil dibuat dan menunggu approval Admin/Owner.",
      orderId,
      amount,
      feeAmount: totalFee,
      netPayoutAmount,
      ...result
    });
  } catch (error) {
    console.error("Create wallet withdrawal error:", error);
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return json({ success: false, error: "User tidak ditemukan." }, 404);
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return json({ success: false, error: "Saldo tersedia tidak mencukupi." }, 400);
    }
    return json({ success: false, error: "Gagal membuat pengajuan withdrawal." }, 500);
  }
};
