/** Is production environment */
export const isProduction = process.env.NODE_ENV === "production";

/** Is development environment */
export const isDevelopment = !isProduction;
