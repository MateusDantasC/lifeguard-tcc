export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  RecuperarSenha: undefined;
  HomeIdoso: undefined;
  HomeCuidador: undefined;
  Perfil: undefined;
  Historico: { idosoId?: string; nome?: string } | undefined;
  MeuDispositivo: undefined;
  ParearDispositivo: undefined;
  Cuidadores: undefined;
  LimitesIdoso: undefined;
  DetalheIdoso: { idosoId: string; nome: string };
  Alertas: undefined;
  ConfigurarLimites: { idosoId: string; nome: string };
  VincularIdoso: undefined;
  ContatoRapido: { idosoId: string; nome: string; telefone: string };
  SemConexao: { origem?: string } | undefined;
};
