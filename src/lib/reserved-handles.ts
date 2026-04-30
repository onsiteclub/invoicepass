// Reserved handle list — names that should not be claimable as inbox addresses.
//
// Combines several standard categories:
//   - RFC 2142 role-based mailbox names (postmaster, abuse, etc.)
//   - System / technical names (admin, root, www, api, etc.)
//   - Defensive brand list (paypal, google, banks, etc.)
//   - Test / placeholder / lorem-ipsum words
//   - Our own product / internal namespace
//   - Profanity (EN + PT-BR), curated subset of LDNOOBW
//
// Match rule: EXACT match only. We never substring-match — that would block
// legitimate names like "assange" because of "ass", or "fagner" because of
// "fag". The cost is missing variants like "fucking-handle", but that's
// acceptable given the trade-off.
//
// IMPORTANT: this list is duplicated in onsite-ops. Keep both in sync —
// otherwise the landing says "available" but the portal rejects on signup.

const RFC_2142_ROLES: readonly string[] = [
  'postmaster', 'hostmaster', 'webmaster', 'usenet', 'news', 'www',
  'uucp', 'ftp', 'noc', 'security', 'abuse', 'info', 'marketing',
  'sales', 'support',
];

const SYSTEM_NAMES: readonly string[] = [
  'admin', 'administrator', 'root', 'system', 'sysadmin', 'staff', 'office',
  'api', 'app', 'apps', 'cdn', 'static', 'assets',
  'mail', 'email', 'noreply', 'no-reply', 'reply', 'bounce', 'bounces',
  'mailer-daemon', 'help', 'helpdesk', 'team', 'teams', 'service', 'services',
  'auth', 'oauth', 'sso', 'login', 'signup', 'register',
  'me', 'you', 'us', 'home', 'dashboard', 'portal', 'console',
  'host', 'server', 'cloud', 'dns', 'smtp', 'imap', 'pop', 'pop3',
  'http', 'https', 'tcp', 'udp', 'localhost', 'ssl', 'tls',
];

const BRANDS: readonly string[] = [
  // Big tech
  'amazon', 'apple', 'google', 'microsoft', 'meta', 'facebook', 'twitter',
  'linkedin', 'tiktok', 'instagram', 'whatsapp', 'snapchat',
  // Payments
  'paypal', 'stripe', 'square', 'venmo', 'wise', 'revolut', 'cash',
  'visa', 'mastercard', 'amex', 'discover',
  // US banks
  'chase', 'citi', 'wellsfargo', 'bofa',
  // BR banks
  'bradesco', 'itau', 'santander', 'caixa', 'nubank', 'inter', 'btg',
  // Commerce / SaaS
  'shopify', 'wix', 'squarespace', 'webflow',
  'airbnb', 'uber', 'lyft', 'doordash',
  'netflix', 'spotify', 'disney', 'hulu', 'youtube',
  'github', 'gitlab', 'bitbucket', 'atlassian', 'slack', 'discord',
  'notion', 'linear', 'figma', 'canva',
  'openai', 'anthropic', 'claude', 'chatgpt',
  'twilio', 'resend', 'sendgrid',
  // Generic placeholder brand
  'acme',
];

const TEST_WORDS: readonly string[] = [
  'test', 'tests', 'testing', 'tester',
  'demo', 'demos',
  'example', 'examples',
  'foo', 'bar', 'baz', 'qux', 'quux',
  'lorem', 'ipsum', 'dolor', 'amet',
  'placeholder', 'sample', 'samples',
  'asdf', 'qwerty', 'aaa', 'abc', 'xyz',
  'hello', 'world', 'helloworld',
  'name', 'user', 'username',
  'guest', 'anonymous', 'anon',
  'temp', 'temporary', 'tmp',
];

const INTERNAL: readonly string[] = [
  'invoicepass', 'invoice-pass',
  'onsiteclub', 'onsite-club', 'onsite',
  'crew', 'foreman', 'contractor', 'company',
  'invoice', 'invoices', 'inbox', 'inboxes',
  'billing', 'finance', 'accounts', 'accounting',
  'contact', 'operator', 'operators',
];

const PROFANITY_EN: readonly string[] = [
  'fuck', 'fucking', 'fucker', 'motherfucker', 'fck', 'fuk', 'phuck', 'fkn',
  'shit', 'shitty', 'sht', 'bullshit',
  'cunt', 'cnt', 'kunt',
  'dick', 'dik', 'dickhead',
  'cock', 'kok',
  'pussy',
  'bitch', 'bich', 'biatch',
  'asshole', 'arsehole',
  'bastard',
  'whore', 'slut',
  'nigger', 'nigga',
  'faggot', 'fag',
  'retard', 'retarded',
  'twat', 'wanker',
  'porn', 'porno', 'xxx',
];

const PROFANITY_PT: readonly string[] = [
  'caralho', 'karalho', 'kralho', 'crlh',
  'porra',
  'foda', 'foder', 'fudido', 'fudida', 'fodase', 'foda-se',
  'merda', 'merdinha', 'merdoso',
  'puta', 'putinha', 'putona', 'putaria',
  'cuzao', 'cuzinho', 'arrombado', 'arrombada',
  'piroca', 'piroquinha',
  'pinto', 'pau', 'penis',
  'boceta', 'buceta', 'xoxota', 'xereca',
  'viado', 'veado',
  'cabaco', 'puto',
  'safado', 'safada',
  'gozada', 'gozar',
  'pentelho',
  'desgracado', 'desgracada',
  'filhodaputa', 'filhadaputa', 'fdp',
  'corno', 'cornudo',
  'otario', 'otaria',
];

const RESERVED = new Set<string>([
  ...RFC_2142_ROLES,
  ...SYSTEM_NAMES,
  ...BRANDS,
  ...TEST_WORDS,
  ...INTERNAL,
  ...PROFANITY_EN,
  ...PROFANITY_PT,
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED.has(handle.toLowerCase().trim());
}
