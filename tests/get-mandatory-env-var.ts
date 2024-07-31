export default function getMandatoryEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing mandatory environment variable: ${name}`);
  }
  return value;
}
