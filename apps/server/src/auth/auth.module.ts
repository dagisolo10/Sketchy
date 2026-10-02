import { AuthController } from "@/auth/auth.controller.js";
import { AuthService } from "@/auth/auth.service.js";
import { Module } from "@nestjs/common";

@Module({
    exports: [AuthService],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
