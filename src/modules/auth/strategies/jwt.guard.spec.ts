import { JwtAuthGuard } from './jwt.guard';

describe('JwtAuthGuard (unit)', () => {
  it('devrait être défini et hériter de AuthGuard(jwt)', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
