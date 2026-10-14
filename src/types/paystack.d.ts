declare module "@paystack/inline-js" {
  type Transaction = { reference: string };
  type Options = {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref?: string;
    onSuccess: (transaction: Transaction) => void | Promise<void>;
    onCancel?: () => void;
  };
  export default class PaystackPop {
    newTransaction(options: Options): void;
  }
}
