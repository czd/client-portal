import { getUser } from '@/lib/supabase/queries';

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
