interface Env {
  DB: D1Database;
  R2_BUCKET?: R2Bucket;
  JWT_SECRET: string;
  RESEND_API_KEY?: string;
  [key: string]: any;
}
