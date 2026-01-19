export default () => ({
  PORT: process.env.PORT,
  SECRET: process.env.SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  database: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSLMODE,
  },
  redis: {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
  },
});
