import type { Transaction } from "@/lib/mock-data"
import { Gift, Award } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RecentActivityProps {
  transactions: Transaction[]
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              transaction.type === "earn" ? "bg-secondary/10" : "bg-primary/10"
            }`}
          >
            {transaction.type === "earn" ? (
              <Gift className="w-4 h-4 text-secondary" />
            ) : (
              <Award className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{transaction.customerName}</p>
            <p className="text-xs text-muted-foreground">
              {transaction.type === "earn" ? "Earned" : "Redeemed"} {transaction.stamps} stamp
              {transaction.stamps !== 1 ? "s" : ""}
              {transaction.location && ` at ${transaction.location}`}
            </p>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  )
}
