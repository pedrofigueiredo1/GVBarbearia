import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientesModule } from '../clientes/clientes.module';
import { AuthClienteController } from './auth-cliente.controller';
import { ClienteJwtStrategy } from './cliente-jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { LoginCliente } from './operacoes/login-cliente';
import { RedefinirSenhaCliente } from './operacoes/redefinir-senha-cliente';
import { SolicitarRecuperacaoSenhaCliente } from './operacoes/solicitar-recuperacao-senha-cliente';

// Login do cliente do app, paralelo e independente do login do administrador
// (src/auth): tem o próprio segredo JWT, a própria estratégia e o próprio guard.
@Module({
  imports: [
    PassportModule,
    ClientesModule,
    MailModule,
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
  providers: [
    LoginCliente,
    SolicitarRecuperacaoSenhaCliente,
    RedefinirSenhaCliente,
    ClienteJwtStrategy,
  ],
})
export class AuthClienteModule {}
