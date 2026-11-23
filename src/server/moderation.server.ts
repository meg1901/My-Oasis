import { moderateContent } from '@/lib/moderation';
export async function moderate(body: string) { return moderateContent(body); }
