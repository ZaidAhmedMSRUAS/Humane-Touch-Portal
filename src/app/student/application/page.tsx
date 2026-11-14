import { redirect } from 'next/navigation';

export default function StudentApplicationRedirect() {
  redirect('/student/dashboard');
}
