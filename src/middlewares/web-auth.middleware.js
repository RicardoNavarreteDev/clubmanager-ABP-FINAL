// Este archivo maneja la sesion web basada en JWT guardado en cookies del navegador.
const AUTH_COOKIE_NAME = "clubmanager_token";
const DEFAULT_AUTH_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24;

const parseExpiresInToMs = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric * 1000;
  }

  const match = String(value).trim().match(/^(\d+)\s*([smhd])$/i);
  if (!match) {
    return fallback;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

  return amount * multipliers[unit];
};

export const getAuthCookieMaxAge = () => parseExpiresInToMs(process.env.JWT_EXPIRES_IN, DEFAULT_AUTH_COOKIE_MAX_AGE);

const parseCookieHeader = (cookieHeader = "") => cookieHeader
  .split(";")
  .map((chunk) => chunk.trim())
  .filter(Boolean)
  .reduce((cookies, entry) => {
    const [rawName, ...rawValueParts] = entry.split("=");

    if (!rawName) {
      return cookies;
    }

    cookies[decodeURIComponent(rawName)] = decodeURIComponent(rawValueParts.join("="));
    return cookies;
  }, {});

export const getRequestCookies = (req) => parseCookieHeader(req.headers.cookie ?? "");

export const getAuthTokenFromRequest = (req) => getRequestCookies(req)[AUTH_COOKIE_NAME] ?? null;

export const appendCookie = (res, name, value, options = {}) => {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push("Secure");
  }

  const currentSetCookieHeader = res.getHeader("Set-Cookie");
  const nextCookieValue = parts.join("; ");

  if (!currentSetCookieHeader) {
    res.setHeader("Set-Cookie", nextCookieValue);
    return;
  }

  const nextCookies = Array.isArray(currentSetCookieHeader)
    ? [...currentSetCookieHeader, nextCookieValue]
    : [currentSetCookieHeader, nextCookieValue];

  res.setHeader("Set-Cookie", nextCookies);
};

export const setAuthCookie = (res, token) => {
  appendCookie(res, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: getAuthCookieMaxAge(),
  });
};

export const clearAuthCookie = (res) => {
  appendCookie(res, AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
};

export const requireWebAuth = (req, res, next) => {
  if (!req.authSession) {
    res.redirect("/login");
    return;
  }

  next();
};

export const requireManagementAccess = (req, res, next) => {
  if (!req.authSession) {
    res.redirect("/login");
    return;
  }

  const roleNames = (req.authSession.user?.roles ?? []).map((role) => role.name);

  if (!roleNames.includes("admin") && !roleNames.includes("coach")) {
    res.redirect("/dashboard");
    return;
  }

  next();
};

export const redirectAuthenticatedUser = (req, res, next) => {
  if (req.authSession) {
    res.redirect("/dashboard");
    return;
  }

  next();
};
