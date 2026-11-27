/** Parse private server/build configuration; never copy config into site output. */
export function makerSettings(env) {
  let origin;
  try { origin = new URL(env.MAKER_V2_ORIGIN); } catch { return null; }
  if (env.SUEDE_SITE !== 'directory' || env.MAKER_V2_ENABLED !== 'true'
    || origin.protocol !== 'https:' || origin.origin !== env.MAKER_V2_ORIGIN
    || origin.hostname === 'skills.suedeai.ai'
    || !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(env.MAKER_V2_DB_URL || '')
    || !/^sb_secret_[a-zA-Z0-9_-]+$/.test(env.MAKER_V2_DB_SECRET_KEY || '')
    || !env.MAKER_V2_GITHUB_CLIENT_ID?.trim() || !env.MAKER_V2_GITHUB_CLIENT_SECRET?.trim()) return null;

  const moderators = new Set((env.MAKER_V2_MODERATOR_IDS || '').split(',').map(value => value.trim())
    .filter(value => /^[1-9]\d*$/.test(value)).map(Number).filter(Number.isSafeInteger));
  return moderators.size ? { origin: origin.origin, moderators } : null;
}
