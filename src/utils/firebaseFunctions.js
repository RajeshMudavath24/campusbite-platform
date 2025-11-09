import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export async function registerFcmTokenClient(token) {
  if (!functions) throw new Error('Service unavailable');
  const callable = httpsCallable(functions, 'registerFcmToken');
  const res = await callable({ token });
  return res?.data || { ok: true };
}


