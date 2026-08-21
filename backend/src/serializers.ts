import type { User } from './generated/prisma/client.js';
import { UserType } from './generated/prisma/enums.js';

export function serializeUser(user: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'type'>) {
  return {
    id: user.id,
    nome: user.name,
    email: user.email,
    telefone: user.phone,
    tipo: user.type === UserType.ELDER ? 'idoso' : 'cuidador',
  };
}
