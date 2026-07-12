import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from './env.js'
import { readSessionToken } from './sessionCookie.js'

export type AuthPayload = {
  role: 'admin'
}

export function signToken(): string {
  return jwt.sign({ role: 'admin' } satisfies AuthPayload, env.jwtSecret, { expiresIn: '12h' })
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = readSessionToken(req.headers.cookie)
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (typeof payload !== 'object' || payload.role !== 'admin') throw new Error('Invalid role')
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
