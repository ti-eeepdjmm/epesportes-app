import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import api from '@/utils/api';
interface User {
  id: string;
  user_metadata: {
    full_name:string;
  };
  email: string;
  profilePhoto?: string;
}

export default function Login() {
  const { signIn } = useAuth();
  const [ user, setUser ] = useState<User>();

  useEffect(() => {
    const doLogin = async () => {
      try {
        const { email, password } = {
          email: 'henryjsalves@gmail.com',
          password: '123456',
        };

        const response = await api.post('/auth/login', { email, password });
        const data = response.data;
        setUser(data.user);

        await signIn(data.session.access_token, {
          id: data.user.id,
          name: data.user.user_metadata.full_name,
          email: data.user.email,
        });

        console.log('✅ Login bem-sucedido:');
      } catch (error) {
        console.error('Erro ao logar:', error);
      }
    };

    doLogin();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Bem-vindo {user?.user_metadata.full_name}!</Text>
    </View>
  );
}
