import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadMenuImage(file, itemId) {
  if (!file) throw new Error('No file');
  const path = `menuImages/${itemId}_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snap.ref);
  return { url, path };
}


