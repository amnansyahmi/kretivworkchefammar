import type { Order } from "./sources/types";

export type Customer = {
  name: string;
  initials: string;
  orderCount: number;
  /** Lifetime value: total of non-refunded orders. */
  lifetimeValue: number;
  averageOrder: number;
  /** The channel this customer has bought through most often. */
  topChannel: Order["channel"];
  channels: Order["channel"][];
  refunds: number;
  lastOrderId: string;
  lastOrderTime: string;
  orders: Order[];
};

/**
 * Groups orders by customer name.
 *
 * Name is the only customer identifier the order feeds give us today — there
 * is no customer ID — so two different people sharing a name would merge.
 * Acceptable for now; revisit if the platform APIs start returning a stable
 * buyer ID.
 */
export function aggregateCustomers(orders: Order[]): Customer[] {
  const groups = new Map<string, Order[]>();
  orders.forEach((order) => {
    const key = order.customer.trim().toLowerCase();
    const existing = groups.get(key);
    if (existing) existing.push(order);
    else groups.set(key, [order]);
  });

  const customers: Customer[] = [];
  groups.forEach((rows) => {
    // Refunded orders still count as orders placed, but not as value earned.
    const earning = rows.filter((o) => o.status !== "Refund");
    const lifetimeValue = earning.reduce((sum, o) => sum + o.amount, 0);

    const channelCounts = new Map<Order["channel"], number>();
    rows.forEach((o) => channelCounts.set(o.channel, (channelCounts.get(o.channel) ?? 0) + 1));
    const topChannel = [...channelCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

    customers.push({
      name: rows[0].customer,
      initials: rows[0].initials,
      orderCount: rows.length,
      lifetimeValue,
      averageOrder: earning.length ? lifetimeValue / earning.length : 0,
      topChannel,
      channels: [...channelCounts.keys()],
      refunds: rows.length - earning.length,
      lastOrderId: rows[0].id,
      lastOrderTime: rows[0].time,
      orders: rows,
    });
  });

  return customers.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
}

export type CustomerSummary = {
  total: number;
  repeat: number;
  repeatRate: number;
  averageLifetimeValue: number;
};

export function summariseCustomers(customers: Customer[]): CustomerSummary {
  const repeat = customers.filter((c) => c.orderCount > 1).length;
  const totalValue = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
  return {
    total: customers.length,
    repeat,
    repeatRate: customers.length ? Math.round((repeat / customers.length) * 100) : 0,
    averageLifetimeValue: customers.length ? totalValue / customers.length : 0,
  };
}
