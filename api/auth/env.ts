const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and set it (e.g. \`openssl rand -base64 32\`).`
    );
  }

  return value;
};

export const JWT_ACCESS_SECRET = requireEnv('JWT_ACCESS_SECRET');
export const JWT_REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET');
