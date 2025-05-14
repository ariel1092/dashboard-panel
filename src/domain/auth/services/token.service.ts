export interface TokenService {
    sign(payload: Record<string, any>, options?: { expiresIn?: string }): Promise<string>;
    verify(token: string): Promise<any>; // opcional: tipar mejor según tu payload
  }