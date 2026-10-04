import { IsNumber } from "class-validator";

export class CreateRoomDto {
    @IsNumber()
    maxPlayers: number;

    @IsNumber()
    drawingTime: number;

    @IsNumber()
    imposterCount: number;
}
