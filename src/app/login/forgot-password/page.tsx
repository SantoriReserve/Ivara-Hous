import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Ivara Hous creator dashboard password.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHero
        label="Creator Dashboard"
        title="Forgot Password"
        description="We'll email you a secure link to reset your password."
      />
      <section className="py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container">
          <ForgotPasswordForm />
        </div>
      </section>
    </>
  );
}
