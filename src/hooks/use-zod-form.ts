import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { z, ZodTypeAny } from "zod";

export function useZodForm<TSchema extends ZodTypeAny>(
  props: Omit<UseFormProps<z.infer<TSchema>>, "resolver"> & { schema: TSchema }
): UseFormReturn<z.infer<TSchema>> {
  const { schema, ...rest } = props;
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...rest,
  });
}
