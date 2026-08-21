import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import RecuperarSenhaScreen from '../screens/RecuperarSenhaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import SemConexaoScreen from '../screens/SemConexaoScreen';
import HomeIdosoScreen from '../screens/idoso/HomeIdosoScreen';
import HomeCuidadorScreen from '../screens/cuidador/HomeCuidadorScreen';
import HistoricoScreen from '../screens/idoso/HistoricoScreen';
import MeuDispositivoScreen from '../screens/idoso/MeuDispositivoScreen';
import CuidadoresScreen from '../screens/idoso/CuidadoresScreen';
import LimitesIdosoScreen from '../screens/idoso/LimitesIdosoScreen';
import ParearDispositivoScreen from '../screens/idoso/ParearDispositivoScreen';
import DetalheIdosoScreen from '../screens/cuidador/DetalheIdosoScreen';
import AlertasScreen from '../screens/cuidador/AlertasScreen';
import ConfigurarLimitesScreen from '../screens/cuidador/ConfigurarLimitesScreen';
import VincularIdosoScreen from '../screens/cuidador/VincularIdosoScreen';
import ContatoRapidoScreen from '../screens/cuidador/ContatoRapidoScreen';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.sand },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
        <Stack.Screen name="HomeIdoso" component={HomeIdosoScreen} />
        <Stack.Screen name="HomeCuidador" component={HomeCuidadorScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Historico" component={HistoricoScreen} />
        <Stack.Screen name="MeuDispositivo" component={MeuDispositivoScreen} />
        <Stack.Screen name="ParearDispositivo" component={ParearDispositivoScreen} />
        <Stack.Screen name="Cuidadores" component={CuidadoresScreen} />
        <Stack.Screen name="LimitesIdoso" component={LimitesIdosoScreen} />
        <Stack.Screen name="DetalheIdoso" component={DetalheIdosoScreen} />
        <Stack.Screen name="Alertas" component={AlertasScreen} />
        <Stack.Screen name="ConfigurarLimites" component={ConfigurarLimitesScreen} />
        <Stack.Screen name="VincularIdoso" component={VincularIdosoScreen} />
        <Stack.Screen name="ContatoRapido" component={ContatoRapidoScreen} />
        <Stack.Screen name="SemConexao" component={SemConexaoScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
