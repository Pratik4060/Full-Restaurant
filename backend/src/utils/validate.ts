import { z } from "zod";

export const validate = <TSchema extends z.ZodTypeAny>(schema: TSchema, data: unknown): z.infer<TSchema> =>
  schema.parse(data);