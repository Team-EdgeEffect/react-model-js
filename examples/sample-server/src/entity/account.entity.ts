import { Gender } from "./../common/service.constant";
import { Column, CreateDateColumn, OneToOne, PrimaryGeneratedColumn, Relation, Unique, UpdateDateColumn } from "typeorm";

@Unique(["accountName"])
export class Account {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column()
    public readonly accountName: string;

    @Column()
    public password: string;

    @OneToOne(() => AccountProfile, (accountProfile) => accountProfile.account)
    public profile: Relation<AccountProfile>;

    @CreateDateColumn()
    public readonly createdAt: Date;
}

export class AccountProfile {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @OneToOne(() => Account, (account) => account.profile, { onDelete: "CASCADE" })
    public account: Relation<Account>;

    @Column({
        type: "enum",
        enum: Gender,
    })
    public gender: Gender;

    public name: string;

    @UpdateDateColumn()
    public readonly updatedAt: Date;
}

export const AccountEntities = [Account, AccountProfile];
