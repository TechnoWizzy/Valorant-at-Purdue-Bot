import {bot} from "../index";
import {Filter, UpdateFilter, UpdateOptions} from "mongodb";

export default class Student {
    private _id: string;
    private _username: string;
    private _email: string;
    private _status: boolean;

    constructor(id: string, username: string, email: string, status: boolean) {
        this._id = id;
        this._username = username;
        this._email = email;
        this._status = status;
    }

    static fromObject(object) {
        if (object == null) return null;
        return new Student(object._id, object._username, object._email, object._status);
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get status(): boolean {
        return this._status;
    }

    set status(value: boolean) {
        this._status = value;
    }

    public async save() {
        const query: Filter<any> = {_id: this.id};
        const update: UpdateFilter<any> = {$set: this};
        const options: UpdateOptions = {upsert: true};
        await bot.database.students.updateOne(query, update, options);
    }

    public static async get(id: string): Promise<Student> {
        try {
            const query = { _id: id };
            const document = await bot.database.students.findOne(query);
            if (!document) return null;
            return Student.fromObject(document);
        } catch (error) {
            return null;
        }
    }
}