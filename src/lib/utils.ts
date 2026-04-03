import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Native browser password hashing (SHA-256)
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Memory-safe hook for rendering Blobs/Files in IndexedDB
export function useMediaUrl(media: string | Blob | undefined | null): string | undefined {
  const [url, setUrl] = useState<string | undefined>(
    typeof media === 'string' ? media : undefined
  );

  useEffect(() => {
    if (media instanceof Blob) {
      const objectUrl = URL.createObjectURL(media);
      setUrl(objectUrl);
      // Clean up the URL to prevent memory leaks when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof media === 'string') {
      // Preserve your cache-busting logic for remote images
      const parsedUrl = media.trim() !== "" 
        ? (media.startsWith('data:') ? media : `${media}?v=3`) 
        : undefined;
      setUrl(parsedUrl);
    } else {
      setUrl(undefined);
    }
  }, [media]);

  return url;
}