export async function registerMechanic(data: {
  name: string;
  garage: string;
  experience: string;
}) {
  console.log("Register mechanic:", data);
  return { ok: true };
}
