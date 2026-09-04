import { render, screen } from '@testing-library/react-native';

import App from './App';

describe('App', () => {
  // RNTL 14 tornou `render` assíncrono: sem o await, `screen` fica vazio.
  it('renderiza o cabeçalho como header acessível', async () => {
    await render(<App />);

    expect(screen.getByRole('header', { name: 'Desenrolai' })).toBeTruthy();
  });

  it('renderiza o subtítulo', async () => {
    await render(<App />);

    expect(screen.getByText('template Expo')).toBeTruthy();
  });
});
