export async function fetchJson(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, { credentials: 'same-origin', ...opts });
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  // If server returned HTML (likely a redirect to login or error page), throw with text
  const err: any = new Error('Non-JSON response');
  err.status = res.status;
  err.body = text;
  throw err;
}

export default fetchJson;
