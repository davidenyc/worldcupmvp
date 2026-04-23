"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReportUpdateValues = {
  name: string;
  email: string;
  update: string;
};

export function ReportUpdateForm() {
  const { register, handleSubmit, reset } = useForm<ReportUpdateValues>();

  function onSubmit() {
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-sm uppercase tracking-[0.2em] text-mist">Report an update</div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input placeholder="Your name" {...register("name")} />
        <Input placeholder="Email" type="email" {...register("email")} />
      </div>
      <Input placeholder="Tell us what changed" {...register("update")} />
      <Button type="submit" variant="secondary">
        Submit update
      </Button>
    </form>
  );
}
