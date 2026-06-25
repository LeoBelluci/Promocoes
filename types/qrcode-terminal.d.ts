declare module "qrcode-terminal" {
  export interface GenerateOptions {
    small?: boolean;
  }

  const qrcodeTerminal: {
    generate(input: string, options?: GenerateOptions): void;
  };

  export default qrcodeTerminal;
}
