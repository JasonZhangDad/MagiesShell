import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from './env.js'

export type AuthPayload = {
  role: 'admin'
}

export function signToken(): string {
  return jwt.sign({ role: 'admin' } satisfies AuthPayload, env.jwtSecret, { expiresIn: '12h' })
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    jwt.verify(header.slice(7), env.jwtSecret)
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
