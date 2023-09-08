import {config} from 'dotenv'

config()

export const PORT = process.env.PORT || 5000
export const DB_PORT = process.env.DB_PORT || 6109
export const DB_HOST = process.env.DB_HOST || "containers-us-west-34.railway.app"
export const DB_USER = process.env.DB_USER || "root"
export const DB_PASSWORD = process.env.DB_PASSWORD || "4NwBUQpZAt5qGpBEFogZ"
export const DB_DATABASES = process.env.DB_DATABASES || "railway"
