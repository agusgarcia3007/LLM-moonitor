import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { setHasSubscription } from "@/lib/cookies";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/_auth/login")({
  component: Login,
});

function Login({ className, ...props }: React.ComponentProps<"form">) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async () => {
          try {
            const expires = new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toUTCString();
            document.cookie = `isAuthenticated=true; expires=${expires}; path=/;`;
            
            const { data: subscriptions } = await authClient.subscription.list();
            const activeSubscription = subscriptions?.find(
              (sub) => sub.status === "active" || sub.status === "trialing"
            );

            setHasSubscription(!!activeSubscription);

            navigate({
              to: activeSubscription ? "/dashboard" : "/pricing",
              search: activeSubscription ? { period: "1" } : undefined,
            });
          } catch (error) {
            console.error("Error checking subscription:", error);
            // Still allow login but redirect to pricing if subscription check fails
            setHasSubscription(false);
            navigate({ to: "/pricing" });
          }
        },
      }
    );
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">
            {t("auth.signin.title", "Login to your account")}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t(
              "auth.signin.description",
              "Enter your email below to login to your account"
            )}
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signin.email", "Email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>{t("auth.signin.password", "Password")}</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    {t("auth.signin.forgot", "Forgot your password?")}
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            {t("auth.signin.submit", "Login")}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("auth.signin.noAccount", "Don't have an account?")}{" "}
          <Link
            to="/signup"
            search={{ plan: undefined, period: undefined }}
            className="underline underline-offset-4"
          >
            {t("auth.signin.signup", "Sign up")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
