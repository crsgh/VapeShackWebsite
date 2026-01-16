export type AppConfig = {
  square: {
    accessToken: string | undefined;
    applicationId: string | undefined;
    environment: "production" | "sandbox";
    locationId: string | undefined;
    webhookSignatureKey: string | undefined;
  };
  mongodb: {
    uri: string | undefined;
    dbName: string | undefined;
  };
  jwt: {
    accessSecret: string | undefined;
    refreshSecret: string | undefined;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  auth: {
    minAge: number;
  };
  maps: {
    apiKey: string | undefined;
  };
  cors: {
    allowedOrigin: string | undefined;
  };
  tasks: {
    syncSquareSecret: string | undefined;
  };
};

export const config: AppConfig = {
  square: {
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
    environment:
      (process.env.SQUARE_ENVIRONMENT as "production" | "sandbox") ||
      "production",
    locationId: process.env.SQUARE_LOCATION_ID,
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  auth: {
    minAge: Number(process.env.AGE_MIN || "21"),
  },
  maps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  cors: {
    allowedOrigin: process.env.CORS_ALLOWED_ORIGIN,
  },
  tasks: {
    syncSquareSecret: process.env.SYNC_SQUARE_SECRET,
  },
};

