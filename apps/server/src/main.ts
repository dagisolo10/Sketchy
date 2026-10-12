import { AppModule } from "@/app.module.js";
import { AllExceptionsFilter } from "@/common/all-exceptions.filter.js";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.enableCors({
        credentials: true,
        origin: [process.env["CLIENT_URL"], "http://172.20.10.4:5173", "http://localhost:5173"],
    });

    const validationPipe = new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    });

    app.useGlobalPipes(validationPipe);
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen(process.env["PORT"] ?? 3000, "0.0.0.0");
}

await bootstrap();
