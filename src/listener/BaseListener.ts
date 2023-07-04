export class ModelEventListener<T = () => void> {
    private listeners: Array<T> = new Array<T>();

    public add(listener: T) {
        this.listeners.push(listener);
    }

    public remove(listener: T) {
        this.listeners.filter((l) => {
            return l !== listener;
        });
    }

    public removeAll() {
        this.listeners = new Array<T>();
    }

    public async iterate(onIterate: (listener: T) => boolean | Promise<boolean>) {
        const size = this.listeners.length;
        for (let i = 0; i < size; i++) {
            const l = this.listeners[i];
            if (!(await onIterate(await l))) {
                break;
            }
        }
    }
}
