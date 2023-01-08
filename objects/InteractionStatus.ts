import {User} from "discord.js";

export default class InteractionStatus {
    private _type: InteractionType;
    private _user: User;
    private _status: boolean;
    private _error: Error;


    constructor(type: InteractionType, user: User, status: boolean, error: Error) {
        this._type = type;
        this._user = user;
        this._status = status;
        this._error = error;
    }

    get type(): InteractionType {
        return this._type;
    }

    set type(value: InteractionType) {
        this._type = value;
    }

    get user(): User {
        return this._user;
    }

    set user(value: User) {
        this._user = value;
    }

    get status(): boolean {
        return this._status;
    }

    set status(value: boolean) {
        this._status = value;
    }

    get error(): Error {
        return this._error;
    }

    set error(value: Error) {
        this._error = value;
    }
}

export enum InteractionType {
    Button="Button",
    Command="Command",
    Menu="Menu",
    Modal="Modal"
}