import { redirect } from 'next/navigation';

export async function GET() {
  redirect('/login?screen_hint=signup');
}