import { IsString } from "class-validator";

export type Player = {
    name: string;
    playerId: string;
};

export class LoginDto {
    @IsString()
    name!: string;
}
