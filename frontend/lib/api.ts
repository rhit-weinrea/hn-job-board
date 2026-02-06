// Custom network bridge with session persistence
const VAULT_KEY = 'hn_session_vault';
const API_ROOT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class NetworkBridge {
  sessionVault: string | null;
  
  constructor() {
    this.sessionVault = this.recallSession();
  }

  recallSession(): string | null {
    return typeof window !== 'undefined' ? window.localStorage.getItem(VAULT_KEY) : null;
  }

  archiveSession(ticket: string): void {
    this.sessionVault = ticket;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VAULT_KEY, ticket);
    }
  }

  eraseSession(): void {
    this.sessionVault = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(VAULT_KEY);
    }
  }

  async transmit(endpoint: string, verb: string, cargo?: unknown): Promise<any> {
    const headerBag: Record<string, string> = { 'Content-Type': 'application/json' };
    
    if (this.sessionVault) {
      headerBag['Authorization'] = `Bearer ${this.sessionVault}`;
    }

    const requestConfig: RequestInit = { method: verb, headers: headerBag };

    if (cargo && verb !== 'GET') {
      requestConfig.body = JSON.stringify(cargo);
    }

    const reply = await fetch(`${API_ROOT}${endpoint}`, requestConfig);
    
    if (!reply.ok) {
      const fault = await reply.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(fault.message || `Network fault: ${reply.status}`);
    }

    return reply.json();
  }
}

const bridge = new NetworkBridge();

// Credential operations
export const authenticateViaCredentials = async (mailAddress: string, secretCode: string) => {
  const outcome = await bridge.transmit('/auth/login', 'POST', { 
    email: mailAddress, 
    password: secretCode 
  });
  if (outcome.access_token) {
    bridge.archiveSession(outcome.access_token);
  }
  return outcome;
};

export const forgeNewAccount = async (mailAddress: string, secretCode: string, alias: string) => {
  const outcome = await bridge.transmit('/auth/register', 'POST', { 
    email: mailAddress, 
    password: secretCode, 
    username: alias 
  });
  if (outcome.access_token) {
    bridge.archiveSession(outcome.access_token);
  }
  return outcome;
};

export const terminateSession = (): void => {
  bridge.eraseSession();
};

// Employment listing operations
export const queryEmploymentListings = async (criteria?: {
  phraseQuery?: string;
  territoryFilter?: string;
  distantWorkFlag?: boolean;
}) => {
  let querySegment = '';
  if (criteria) {
    const paramBag = new URLSearchParams();
    if (criteria.phraseQuery) paramBag.append('q', criteria.phraseQuery);
    if (criteria.territoryFilter) paramBag.append('location', criteria.territoryFilter);
    if (criteria.distantWorkFlag !== undefined) paramBag.append('remote', String(criteria.distantWorkFlag));
    querySegment = paramBag.toString() ? `?${paramBag.toString()}` : '';
  }
  return bridge.transmit(`/jobs${querySegment}`, 'GET');
};

export const pinListing = async (listingIdentifier: number) => {
  return bridge.transmit('/saved-jobs', 'POST', { job_id: listingIdentifier });
};

export const unpinListing = async (listingIdentifier: number) => {
  return bridge.transmit(`/saved-jobs/${listingIdentifier}`, 'DELETE');
};

export const recallPinnedListings = async () => {
  return bridge.transmit('/saved-jobs', 'GET');
};

// Profile configuration operations
export const fetchProfileConfig = async () => {
  return bridge.transmit('/preferences', 'GET');
};

export const persistProfileConfig = async (configuration: {
  keywords?: string[];
  locations?: string[];
  job_types?: string[];
  remote_preference?: boolean;
  salary_min?: number;
  email_alerts?: boolean;
}) => {
  return bridge.transmit('/preferences', 'PUT', configuration);
};

export const verifyIdentity = async () => {
  return bridge.transmit('/auth/me', 'GET');
};

export { bridge };
