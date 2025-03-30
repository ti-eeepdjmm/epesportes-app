import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerOnboard: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins_400Regular',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 24,
  },
});
