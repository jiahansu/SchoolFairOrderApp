/// <reference types="vite/client" />

// 讓 TypeScript 認得 .vue 檔案的型別，避免 TS7016 錯誤
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
