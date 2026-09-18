// API Client for Next.js / Node.js Backend & React Native

export const API_BASE_URL = 'http://localhost:3000/api';

export interface CollectionPayload {
  loanId: string;
  customerId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  proofImageUrl?: string;
  remarks?: string;
}

export async function submitMobileCollection(agentPin: string, payload: CollectionPayload) {
  const response = await fetch(`${API_BASE_URL}/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agent-pin': agentPin,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit collection: ${response.statusText}`);
  }

  return response.json();
}
