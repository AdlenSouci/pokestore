import { IsInt, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
    @IsInt()
    @IsPositive()
    cardId: number;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemDto {
    @IsInt()
    @Min(1)
    quantity: number;
}
