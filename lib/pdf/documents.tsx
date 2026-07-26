import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#111111" },
  headRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: "#111111", paddingBottom: 10, marginBottom: 16 },
  brandName: { fontSize: 15, fontWeight: 700 },
  brandSub: { fontSize: 9, color: "#444444", marginTop: 3 },
  docNoBlock: { alignItems: "flex-end" },
  docNoLabel: { fontSize: 8, color: "#444444" },
  docNoValue: { fontSize: 11, fontWeight: 700, marginVertical: 2 },
  metaRow: { flexDirection: "row", marginBottom: 16, gap: 16 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 8, color: "#444444" },
  metaValue: { fontSize: 10, fontWeight: 700, marginTop: 3 },
  metaSub: { fontSize: 8, color: "#444444", marginTop: 2 },
  table: { marginBottom: 14 },
  tableHeadRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#111111", paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#cccccc", paddingVertical: 5 },
  th: { fontSize: 8, color: "#444444" },
  td: { fontSize: 9 },
  colOrder: { width: "14%" },
  colCustomer: { width: "20%" },
  colChannel: { width: "14%" },
  colProduct: { width: "26%" },
  colStatus: { width: "14%" },
  colAmount: { width: "12%", textAlign: "right" },
  summaryLabel: { flex: 1, fontSize: 9 },
  summaryValue: { fontSize: 9, fontWeight: 700 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 2, borderBottomWidth: 2, borderTopColor: "#111111", borderBottomColor: "#111111", paddingVertical: 10, marginBottom: 14 },
  totalLabel: { fontSize: 10, fontWeight: 700 },
  totalValue: { fontSize: 15, fontWeight: 700 },
  note: { fontSize: 8, color: "#444444", marginBottom: 20, lineHeight: 1.5 },
  footer: { fontSize: 8, color: "#666666", borderTopWidth: 0.5, borderTopColor: "#cccccc", paddingTop: 8 },
});

export type StatementPdfOrder = { id: string; customer: string; channel: string; item: string; statusLabel: string; amountLabel: string };

export function StatementPdfDocument({
  invoiceNo,
  period,
  statusLabel,
  ordersCount,
  netSalesLabel,
  commissionRateLabel,
  totalLabel,
  mode,
  orders,
}: {
  invoiceNo: string;
  period: string;
  statusLabel: string;
  ordersCount: number;
  netSalesLabel: string;
  commissionRateLabel: string;
  totalLabel: string;
  mode: "summary" | "detailed";
  orders: StatementPdfOrder[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headRow}>
          <View>
            <Text style={styles.brandName}>KretivCo Sdn. Bhd.</Text>
            <Text style={styles.brandSub}>Commission Statement · KretivWork x Chef Ammar</Text>
          </View>
          <View style={styles.docNoBlock}>
            <Text style={styles.docNoLabel}>STATEMENT NO.</Text>
            <Text style={styles.docNoValue}>{invoiceNo}</Text>
            <Text style={styles.brandSub}>{period}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>BILL TO</Text>
            <Text style={styles.metaValue}>Chef Ammar Group</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>PAY TO</Text>
            <Text style={styles.metaValue}>KretivCo Sdn. Bhd.</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>STATUS</Text>
            <Text style={styles.metaValue}>{statusLabel}</Text>
          </View>
        </View>

        {mode === "detailed" && orders.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeadRow}>
              <Text style={[styles.th, styles.colOrder]}>ORDER</Text>
              <Text style={[styles.th, styles.colCustomer]}>CUSTOMER</Text>
              <Text style={[styles.th, styles.colChannel]}>CHANNEL</Text>
              <Text style={[styles.th, styles.colProduct]}>PRODUCT</Text>
              <Text style={[styles.th, styles.colStatus]}>STATUS</Text>
              <Text style={[styles.th, styles.colAmount]}>AMOUNT</Text>
            </View>
            {orders.map((o) => (
              <View style={styles.tableRow} key={o.id}>
                <Text style={[styles.td, styles.colOrder]}>{o.id}</Text>
                <Text style={[styles.td, styles.colCustomer]}>{o.customer}</Text>
                <Text style={[styles.td, styles.colChannel]}>{o.channel}</Text>
                <Text style={[styles.td, styles.colProduct]}>{o.item}</Text>
                <Text style={[styles.td, styles.colStatus]}>{o.statusLabel}</Text>
                <Text style={[styles.td, styles.colAmount]}>{o.amountLabel}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.summaryLabel}>Orders completed</Text>
            <Text style={styles.summaryValue}>{ordersCount}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.summaryLabel}>Net sales</Text>
            <Text style={styles.summaryValue}>{netSalesLabel}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.summaryLabel}>Commission rate</Text>
            <Text style={styles.summaryValue}>{commissionRateLabel}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total KretivWork commission</Text>
          <Text style={styles.totalValue}>{totalLabel}</Text>
        </View>

        <Text style={styles.note}>Pending orders, refunds and cancellations are excluded from this calculation.</Text>
        <Text style={styles.footer}>KretivWork x Chef Ammar Central Sales — this is a system-generated statement.</Text>
      </Page>
    </Document>
  );
}

export function InvoicePdfDocument({
  isReceipt,
  docNo,
  statusLabel,
  period,
  issuedDate,
  dueOrPaidLabel,
  dueOrPaidDate,
  reference,
  payToSub,
  lines,
  totalLabel,
  totalAmount,
  note,
}: {
  isReceipt: boolean;
  docNo: string;
  statusLabel: string;
  period: string;
  issuedDate: string;
  dueOrPaidLabel: string;
  dueOrPaidDate: string;
  reference: string;
  payToSub: string;
  lines: { description: string; amount: string }[];
  totalLabel: string;
  totalAmount: string;
  note: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headRow}>
          <View>
            <Text style={styles.brandName}>KretivCo Sdn. Bhd.</Text>
            <Text style={styles.brandSub}>Commission payable to KretivWork</Text>
          </View>
          <View style={styles.docNoBlock}>
            <Text style={styles.docNoLabel}>{isReceipt ? "PAYMENT RECEIPT" : "COMMISSION INVOICE"}</Text>
            <Text style={styles.docNoValue}>{docNo}</Text>
            <Text style={styles.brandSub}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>BILL TO</Text>
            <Text style={styles.metaValue}>Chef Ammar Group</Text>
            <Text style={styles.metaSub}>Sales revenue owner</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>PAY TO</Text>
            <Text style={styles.metaValue}>KretivCo Sdn. Bhd.</Text>
            <Text style={styles.metaSub}>{payToSub}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>PERIOD</Text>
            <Text style={styles.metaValue}>{period}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>ISSUED</Text>
            <Text style={styles.metaValue}>{issuedDate}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>{dueOrPaidLabel.toUpperCase()}</Text>
            <Text style={styles.metaValue}>{dueOrPaidDate}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>REFERENCE</Text>
            <Text style={styles.metaValue}>{reference}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeadRow}>
            <Text style={{ flex: 1, fontSize: 8, color: "#444444" }}>DESCRIPTION</Text>
            <Text style={{ fontSize: 8, color: "#444444" }}>AMOUNT</Text>
          </View>
          {lines.map((line, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={{ flex: 1, fontSize: 9 }}>{line.description}</Text>
              <Text style={{ fontSize: 9 }}>{line.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
          <Text style={styles.totalValue}>{totalAmount}</Text>
        </View>

        <Text style={styles.note}>{note}</Text>
      </Page>
    </Document>
  );
}
