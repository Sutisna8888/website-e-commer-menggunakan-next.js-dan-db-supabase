import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'RasaNusantaraSuperSecretKey123!@#';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface UserSessionPayload {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Membuat token JWT baru
 */
export async function signJWT(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token berlaku selama 24 jam
    .sign(secretKey);
}

/**
 * Memverifikasi token JWT dan mengembalikan isinya
 */
export async function verifyJWT(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as UserSessionPayload;
  } catch (error) {
    console.error('Error saat verifikasi JWT:', error);
    return null;
  }
}
