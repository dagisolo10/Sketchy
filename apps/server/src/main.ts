import { AppModule } from "@/app.module.js";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.enableCors({
        credentials: true,
        origin: "http://172.20.10.4:5173",
    });

    const validationPipe = new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    });

    app.useGlobalPipes(validationPipe);

    await app.listen(process.env["PORT"] ?? 3000, "0.0.0.0");
}

await bootstrap();
