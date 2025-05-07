"use client";
import AuthPage from "@/features/auth/components/AuthPage";
import React from "react";
import { loginSchema } from "@/features/auth/lib/validations";
import { login } from "@/features/auth/actions/auth.actions";

const Login = () => {
  return (
    <AuthPage
      type="login"
      schema={loginSchema}
      onSubmit={login}
      defaultValues={{ email: "", password: "" }}
    />
  );
};

export default Login;
