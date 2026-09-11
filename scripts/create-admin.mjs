import { createClient } from "@supabase/supabase-js";
const {
  NEXT_PUBLIC_SUPABASE_URL: url,
  SUPABASE_SECRET_KEY: key,
  PP_ADMIN_EMAIL: email,
  PP_ADMIN_PASSWORD: password,
} = process.env;
if (!url || !key || !email || !password || password.length < 12)
  throw new Error(
    "Set Supabase URL/key and PP_ADMIN_EMAIL / PP_ADMIN_PASSWORD (12+ characters) in your ignored local environment.",
  );
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error)
  throw new Error(
    `Admin creation failed (${error.status}). No existing account was modified.`,
  );
const { error: roleError } = await db
  .from("admin_users")
  .insert({ user_id: data.user.id });
if (roleError)
  throw new Error(
    `Auth account created but admin grant failed. Add user ${data.user.id} to admin_users after checking the schema.`,
  );
console.log(
  "Admin account created. Sign in locally at /admin. Remove PP_ADMIN_PASSWORD from the environment after setup.",
);
