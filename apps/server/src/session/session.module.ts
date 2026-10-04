import { SessionContext } from "@/session/session.context.js";
import { SessionController } from "@/session/session.controller.js";
import { SessionService } from "@/session/session.service.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    exports: [SessionService, SessionContext],
    providers: [SessionService, SessionContext],
    controllers: [SessionController],
})
export class SessionModule {}
