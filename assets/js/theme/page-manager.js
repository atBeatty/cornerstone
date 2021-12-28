export default class PageManager {
    constructor(context) {
        this.context = context;
    }

    type() {
        return this.constructor.name;
    }

    onReady() {
    }

    static load(context) {
        const page = new this(context);
        console.log(context)
        $(document).ready(() => {
            page.onReady.bind(page)();
        });
    }
}
