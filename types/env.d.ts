namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;
    DATABASE_URL: string;
    DIRECT_URL: string;
    // Ajoutez ici d'autres variables d'environnement que vous utilisez
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  }
}
