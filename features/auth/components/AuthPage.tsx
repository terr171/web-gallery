"use client";

import { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  Path,
  useForm,
  UseFormReturn,
} from "react-hook-form";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export type FormType = "login" | "registration";
const messages = {
  login: "Login",
  registration: "Create Account",
};

interface Props<T extends FieldValues> {
  type: FormType;
  schema: ZodType;
  onSubmit: (data: T) => Promise<ActionResult>;
  defaultValues: T;
}

const AuthPage = <T extends FieldValues>({
  type,
  schema,
  onSubmit,
  defaultValues,
}: Props<T>) => {
  const router = useRouter();

  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);

  const animateError = (message: string) => {
    setError(message);
    setErrorKey((prev) => prev + 1);
  };

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit = async (data: T) => {
    const result = await onSubmit(data);
    if (result.success) {
      router.push("/");
    } else {
      animateError(result.error);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-md mb-4">
        <h1 className="text-3xl font-extrabold mb-4 text-center text-gray-900">
          Web-gallery
        </h1>
      </div>

      <Card className="max-w-96 w-full mx-auto ">
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 "
            >
              <h1 className="text-md font-bold">{messages[type]}</h1>
              {error !== "" && (
                <p
                  key={errorKey}
                  className="text-red-600 animate-shake text-sm"
                >
                  {error}
                </p>
              )}
              {type === "registration" && (
                <FormField
                  control={form.control}
                  name={"username" as Path<T>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name={"email" as Path<T>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@gmail.com"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={"password" as Path<T>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full rounded-lg bg-gray-800 hover:bg-black"
              >
                {messages[type]}
              </Button>
              <div className="flex justify-center">
                <p className="text-xs text-gray-600 ">
                  {type === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <Link
                    href={type === "login" ? "/register" : "/login"}
                    className="hover:underline ml-2 hover:text-gray-900"
                  >
                    {type === "login" ? "Create an account" : "Login"}
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
