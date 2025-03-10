import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import JWTConfig from "../../config/jwt.config"
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt-access"){
    constructor (private readonly jwtConfig: ConfigService) {
        super({ 
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: String(jwtConfig.get<string>('jwt.secretKey'))
        })
    }

    validate(payload: any): unknown {
        return { userId: payload.sub, username: payload.username };
    }
}