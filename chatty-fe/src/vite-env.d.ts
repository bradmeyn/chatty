/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
