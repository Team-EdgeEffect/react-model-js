import { Account, AccountEntities, AccountProfile } from "./account.entity";
import { Food, FoodEntities } from "./food.entity";

export const Entities = [
    // Account
    ...AccountEntities,
    // Food
    ...FoodEntities,
];
