/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

declare module 'next' {
  export interface NextPage<P = {}, IP = P> {
    getInitialProps?(context: any): Promise<IP>;
  }
}

declare module 'next/router' {
  export function useRouter(): {
    push: (url: string) => void;
    query: { [key: string]: string | string[] | undefined };
  };
} 