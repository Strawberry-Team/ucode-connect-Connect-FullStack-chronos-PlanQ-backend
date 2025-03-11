import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtConfirmEmailGuard extends AuthGuard('jwt-confirm-email') {}
