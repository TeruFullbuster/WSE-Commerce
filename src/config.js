import {config} from 'dotenv'

config()

export const PORT = process.env.PORT || 3001
export const DB_PORT = process.env.DB_PORT || 59373
export const DB_HOST = process.env.DB_HOST || "viaduct.proxy.rlwy.net"
export const DB_USER = process.env.DB_USER || "root"
export const DB_PASSWORD = process.env.DB_PASSWORD || "1aAA2ACHDBG5fABA1g4hCHb5eB2H5dAc"
export const DB_DATABASES = process.env.DB_DATABASES || "railway"
export const SECRET_KEY = process.env.SECRET_KEY || 'RSt8xbzNDACYZ6fDO.hgEegP1tGoC4V1LbaMIbGZHp.Vq6kd.OdQ6'
