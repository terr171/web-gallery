import * as schema from "@/database/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const sql = postgres(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
