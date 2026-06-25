import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(fileName: string) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = requiredEnv("SUPABASE_URL");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const adminName = requiredEnv("ADMIN_NAME");
const adminEmail = requiredEnv("ADMIN_EMAIL").toLowerCase();
const adminPassword = requiredEnv("ADMIN_PASSWORD");

if (adminPassword.length < 8) {
  throw new Error("ADMIN_PASSWORD must have at least 8 characters.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

const passwordHash = await bcrypt.hash(adminPassword, 12);

const { data, error } = await supabase
  .from("admin_users")
  .upsert(
    {
      name: adminName,
      email: adminEmail,
      password_hash: passwordHash,
      role: "admin"
    },
    { onConflict: "email" }
  )
  .select("id,email,role")
  .single();

if (error) {
  throw new Error(`Could not create admin user: ${error.message}`);
}

if (!data) {
  throw new Error("Admin user was not returned by Supabase.");
}

console.log(`Admin user ready: ${data.email} (${data.role})`);
