
# 🏆 EPesportes App

Aplicativo mobile do **EPesportes**, uma plataforma interativa para acompanhar campeonatos interclasses, estatísticas de jogos, escalações, desafios e muito mais! Desenvolvido em **React Native com Expo**, este repositório contém o código-fonte da interface mobile do projeto.

---

## 📱 Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [Axios](https://axios-http.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/) (validações)
- [SVG Icons e Assets customizados](./assets)
- Suporte a **tema escuro** e **modo claro**

---

## 📂 Estrutura do Projeto

```bash
.
├── app/                 # Navegação principal (rotas e stacks)
├── assets/              # Imagens, SVGs, fontes e ícones
├── components/          # Componentes reutilizáveis
├── constants/           # Constantes globais (ex: cores, variáveis, etc.)
├── context/             # Context API para estado global (ex: auth, tema)
├── hooks/               # Custom Hooks
├── utils/               # Utilitários diversos (formatadores, helpers)
├── app.json             # Configuração do projeto Expo
├── eas.json             # Configuração do EAS Build
├── tsconfig.json        # Configuração do TypeScript
├── package.json         # Dependências e scripts do projeto
└── README.md            # Documentação do projeto

---

## ⚙️ Instalação

1. Clone este repositório:

```bash
git clone https://github.com/seu-usuario/epesportes-frontend.git
cd epesportes-frontend
```

2. Instale as dependências:

```bash
npm install
# ou
yarn
```

3. Inicie o projeto com o Expo:

```bash
npx expo start
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
API_URL=https://sua-api.com/api
```

Utilize a biblioteca `expo-constants` ou `react-native-dotenv` para ler essas variáveis.

---

## 📌 Funcionalidades Principais

- [x] Autenticação de usuários (aluno, professor)
- [x] Cadastro de time favorito
- [x] Feed de postagens com comentários e reações
- [x] Tabela de classificação e estatísticas
- [x] Escalação de jogadores
- [x] Desafios, enquetes e sistema de votação
- [x] Integração com WebSocket (notificações em tempo real)
- [x] Modo escuro e responsividade mobile first

---

## 🚀 Próximas Entregas

- [x] Fluxo de onboarding do App
- [x] Fluxo de auth do App 
- [ ] Fluxo de register do App
- [ ] Tela home 
- [ ] Notificações push
- [ ] Tela resenha e feed

---

## 👨‍💻 Contribuindo

1. Faça um fork do projeto.
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça commit das suas alterações: `git commit -m 'feat: minha nova funcionalidade'`
4. Push para sua branch: `git push origin minha-feature`
5. Abra um Pull Request

---

## 🧪 Testes

> Em breve: configuração de testes com Jest + Testing Library.

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---
