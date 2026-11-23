// Uniform return shape for Server Actions consumed by the client.
export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
