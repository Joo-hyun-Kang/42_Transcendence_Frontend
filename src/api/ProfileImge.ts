import axios, { AxiosResponse } from 'axios';

export function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64 string'));
      }
    };
    reader.readAsDataURL(blob);
  });
}

export const getImageUrl = async (
  userId: string,
  token: string,
): Promise<string> => {
  const response: AxiosResponse<Blob> = await axios.get(
    `http://localhost:3000/account/image?userId=${userId}`,
    {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const imageUrl: string = await toBase64(response.data);
  return imageUrl;
};
