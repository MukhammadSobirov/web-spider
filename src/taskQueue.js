module.exports.TaskQueue = class TaskQueue {
    limit = 0;
    running = 0;
    queue = [];

    constructor(limit = 10) {
        this.limit = limit;
    }

    pushTask(task) {
        this.queue.push(task);
        this.next();
    }

    next() {
        while (this.running < this.limit && this.queue.length) {
            const task = this.queue.shift();

            task((err) => {
                this.running--;
                this.next();
            });
            this.running++;
        }
    }
}