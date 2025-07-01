import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { LoginUserUseCase } from 'src/aplication/auth/login-user.useCase';
import { RegisterUserUseCase } from 'src/aplication/auth/register-user.usecase';
import { LoginDto } from 'src/aplication/auth/dto/login.dto';
import { RegisterDto } from 'src/aplication/auth/dto/register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado con éxito' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() body: RegisterDto) {

    const { email, password, role } = body;
    const result = await this.registerUserUseCase.execute(email, password,role);
    return { message: 'Usuario registrado con éxito', ...result };
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    const result = await this.loginUserUseCase.execute(email, password);
    return { message: 'Login exitoso', ...result };
  }
}
