/// <reference types="react-scripts" />

declare module '*.css' {
  const content: { [key: string]: string };
  export default content;
}

declare module '*.css?inline' {
  const content: string;
  export default content;
}
