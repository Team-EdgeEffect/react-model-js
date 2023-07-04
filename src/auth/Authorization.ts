export class Authorization {
    constructor(public code: string, public token: string) {}

    public toString() {
        return `${this.code} ${this.token}`;
    }

    public equals(object: any) {
        let isEquals = false;
        if (object instanceof Authorization) {
            isEquals = this.toString() === object.toString();
        }
        return isEquals;
    }
}
