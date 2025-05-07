"use client";

import AuthPage from "@/features/auth/components/AuthPage";
import React from "react";
import { registerSchema } from "@/features/auth/lib/validations";
import { register } from "@/features/auth/actions/auth.actions";
const Register = () => {
  return (
    <AuthPage
      type="registration"
      schema={registerSchema}
      onSubmit={register}
      defaultValues={{ username: "", email: "", password: "" }}
    />
  );
};

export default Register;
