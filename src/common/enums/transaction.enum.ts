export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer'
}

export enum TransactionCategory {
  INCOME = 'income',
  DINING = 'dining',
  SHOPPING = 'shopping',
  UTILITIES = 'utilities',
  TRANSPORTATION = 'transportation',
  ENTERTAINMENT = 'entertainment',
  HOUSING = 'housing',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  TRANSFER = 'transfer',
  OTHER = 'other'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
