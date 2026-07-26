export type Order = {
  id: string;
  customer: string;
  initials: string;
  channel: "BCL.my" | "Shopee" | "TikTok Shop";
  item: string;
  productCode: string;
  productTone: string;
  payment: string;
  amount: number;
  time: string;
  status: "Selesai" | "Diproses" | "Refund";
};
