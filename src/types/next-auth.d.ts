import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'ADMIN' | 'KEUANGAN';
      companyId: number;
      company: {
        id: number;
        name: string;
        code: string | null;
      };
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'KEUANGAN';
    companyId: number;
    company: {
      id: number;
      name: string;
      code: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'KEUANGAN';
    companyId: number;
    company: {
      id: number;
      name: string;
      code: string | null;
    };
  }
}