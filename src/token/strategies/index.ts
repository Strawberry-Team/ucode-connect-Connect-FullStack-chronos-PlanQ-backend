import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import JWTConfig from "../../config/jwt.config"
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor (private readonly jwtConfig: ConfigService) {
        super({ 
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: String(jwtConfig.get<string>('jwt.secretKey'))
        })
    }

    validate(payload: any[]): unknown {
        throw new Error("Method not implemented.");
        return {...payload}
    }
}