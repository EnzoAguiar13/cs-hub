import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type VerifyCallback, type Profile } from "passport-google-oauth20";
import type { GoogleProfile } from "../application/login-with-google.use-case";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: config.get<string>("GOOGLE_CLIENT_SECRET") ?? "",
      callbackURL: config.get<string>("GOOGLE_CALLBACK_URL") ?? "",
      scope: ["email", "profile"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error("Perfil do Google sem email"), undefined);
      return;
    }
    const googleProfile: GoogleProfile = { googleId: profile.id, email };
    done(null, googleProfile);
  }
}
