import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import HomeIdosoScreen from '../screens/idoso/HomeIdosoScreen';
import HomeCuidadorScreen from '../screens/cuidador/HomeCuidadorScreen';
import HistoricoScreen from '../screens/idoso/HistoricoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="HomeIdoso" component={HomeIdosoScreen} />
        <Stack.Screen name="HomeCuidador" component={HomeCuidadorScreen} />
        <Stack.Screen name="Historico" component={HistoricoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}