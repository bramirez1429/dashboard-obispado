import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        identifier: {
          label: "Usuario o teléfono",
          type: "text",
        },
        password: {
          label: "Contraseña",
          type: "password",
        },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier || "").trim();
        const password = String(credentials?.password || "");

        if (!identifier || !password) {
          return null;
        }

        const userSelect =
          "id, user_uuid, name, lastname, username, phone, password_hash, role, active";

        const { data: usernameUser, error: usernameError } = await supabaseAdmin
          .from("Users")
          .select(userSelect)
          .eq("username", identifier)
          .maybeSingle();

        if (usernameError) {
          console.log("LOGIN DEBUG", {
            reason: "username_query_error",
            error: usernameError.message,
          });
          return null;
        }

        let user = usernameUser;

        if (!user) {
          const { data: phoneUser, error: phoneError } = await supabaseAdmin
            .from("Users")
            .select(userSelect)
            .eq("phone", identifier)
            .maybeSingle();

          if (phoneError) {
            console.log("LOGIN DEBUG", {
              reason: "phone_query_error",
              error: phoneError.message,
            });
            return null;
          }

          user = phoneUser;
        }

        if (!user) {
          console.log("LOGIN DEBUG", {
            reason: "user_not_found",
            identifier,
          });
          return null;
        }

        if (user.active === false) {
          console.log("LOGIN DEBUG", {
            reason: "inactive_user",
            identifier,
          });
          return null;
        }

        if (!user.user_uuid) {
          console.log("LOGIN DEBUG", {
            reason: "missing_user_uuid",
            identifier,
          });
          return null;
        }

        if (!user.password_hash) {
          console.log("LOGIN DEBUG", {
            reason: "missing_password_hash",
            identifier,
          });
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          password,
          user.password_hash
        );

        console.log("LOGIN DEBUG - VALIDACIÓN", {
          identifier,
          foundUser: true,
          username: user.username,
          phone: user.phone,
          fullName: `${user.name || ""} ${user.lastname || ""}`.trim(),
          role: user.role,
          active: user.active,
          hasUserUuid: Boolean(user.user_uuid),
          isValidPassword,
        });

        if (!isValidPassword) {
          return null;
        }

        console.log("LOGIN SUCCESS - USUARIO AUTENTICADO", {
          message: "Validación exitosa. Usuario y contraseña correctos.",
          userUuid: String(user.user_uuid),
          fullName:
            `${user.name || ""} ${user.lastname || ""}`.trim() ||
            user.username ||
            user.phone,
          username: user.username,
          phone: user.phone,
          role: user.role || "leader",
        });

        await supabaseAdmin
          .from("Users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);

        return {
          id: String(user.user_uuid),
          name:
            `${user.name || ""} ${user.lastname || ""}`.trim() ||
            user.username ||
            user.phone,
          username: user.username,
          phone: user.phone,
          role: user.role || "leader",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as typeof user & {
          username?: string | null;
          phone?: string | null;
          role?: string | null;
        };

        token.id = authUser.id;
        token.name = authUser.name;
        token.username = authUser.username;
        token.phone = authUser.phone;
        token.role = authUser.role;

        console.log("JWT CALLBACK - DATOS GUARDADOS EN TOKEN", {
          id: token.id,
          name: token.name,
          username: token.username,
          phone: token.phone,
          role: token.role,
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & {
          id: string;
          username: string;
          phone: string;
          role: string;
        };

        sessionUser.id = token.id as string;
        sessionUser.name = token.name as string;
        sessionUser.username = token.username as string;
        sessionUser.phone = token.phone as string;
        sessionUser.role = token.role as string;

        console.log("SESSION CALLBACK - DATOS DISPONIBLES EN SESSION", {
          id: sessionUser.id,
          name: sessionUser.name,
          username: sessionUser.username,
          phone: sessionUser.phone,
          role: sessionUser.role,
        });
      }

      return session;
    },
  },
});
