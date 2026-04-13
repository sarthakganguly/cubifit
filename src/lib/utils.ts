import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Native browser password hashing (SHA-256) with fallback for insecure contexts
export async function hashPassword(password: string): Promise<string> {
  // 1. Check if we have the secure Web Crypto API
  if (window.isSecureContext && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 2. Fallback for insecure contexts (e.g., accessing via IP over HTTP)
  console.warn(
    "Security Warning: You are accessing the app over an insecure connection (non-HTTPS and non-localhost). " +
    "The Web Crypto API is disabled by the browser. Falling back to a basic hash for development/prototyping."
  );

  // Simple non-cryptographic hash (sdbm) for development purposes only
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = password.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
  }
  // Return as a hex string with a prefix to distinguish it from SHA-256
  return 'insecure-' + (hash >>> 0).toString(16);
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