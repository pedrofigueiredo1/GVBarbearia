import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientesModule } from '../clientes/clientes.module';
import { AuthClienteController } from './auth-cliente.controller';
import { ClienteJwtStrategy } from './cliente-jwt.strategy';
import { LoginCliente } from './operacoes/login-cliente';

// Login do cliente do app, paralelo e independente do login do administrador
// (src/auth): tem o próprio segredo JWT, a própria estratégia e o próprio guard.
@Module({
  imports: [
    PassportModule,
    ClientesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('CLIENTE_JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthClienteController],
  providers: [LoginCliente, ClienteJwtStrategy],
})
export class AuthClienteModule {}
