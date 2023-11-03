import { Column, PrimaryGeneratedColumn, Unique } from "typeorm";

@Unique(["name"])
export class Food {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column()
    public name: string;

    @Column()
    public description: string;
}

export const FoodEntities = [Food];
