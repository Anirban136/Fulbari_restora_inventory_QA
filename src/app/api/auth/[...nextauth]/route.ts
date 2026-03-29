import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export async function GET(req: Request, props: any) {
  return handler(req, props);
}

export async function POST(req: Request, props: any) {
  return handler(req, props);
}

export const dynamic = 'force-dynamic';
