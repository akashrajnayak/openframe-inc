import { standaloneApiFetch } from '../services/standaloneMockService';

export function resolveApiUrl(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export interface SafeJsonResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  rawText: string;
  isJson: boolean;
  errorMessage: string;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return standaloneApiFetch(resolveApiUrl(path), init);
}

export async function safeParseJsonResponse<T = any>(res: Response): Promise<SafeJsonResult<T>> {
  let rawText = '';
  try {
    rawText = await res.text();
  } catch {
    return {
      ok: false,
      status: res.status,
      data: null,
      rawText: '',
      isJson: false,
      errorMessage: `Unable to read response (HTTP ${res.status}).`,
    };
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      ok: res.ok,
      status: res.status,
      data: null,
      rawText,
      isJson: false,
      errorMessage: res.ok ? '' : `Empty response (HTTP ${res.status}).`,
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as T;
    const errFromBody =
      parsed && typeof parsed === 'object' && 'error' in (parsed as any) && typeof (parsed as any).error === 'string'
        ? (parsed as any).error
        : '';
    return {
      ok: res.ok,
      status: res.status,
      data: parsed,
      rawText,
      isJson: true,
      errorMessage: res.ok ? '' : errFromBody || `Request failed (HTTP ${res.status}).`,
    };
  } catch {
    return {
      ok: false,
      status: res.status,
      data: null,
      rawText,
      isJson: false,
      errorMessage: `Unexpected response format (HTTP ${res.status}).`,
    };
  }
}
