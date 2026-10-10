import { IsInt, Max, Min } from "class-validator";


export class UpdateRoomSettingsDto {
    @IsInt()
    @Min(3)
    @Max(10)
    maxPlayers: number;

    @IsInt()
    @Min(10)
    @Max(120)
    drawingTime: number;

    @IsInt()
    @Min(1)
    @Max(3)
    imposters: number;
}
