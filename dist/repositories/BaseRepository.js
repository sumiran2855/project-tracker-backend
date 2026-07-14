export class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(item) {
        return this.model.create(item);
    }
    async findById(id) {
        return this.model.findById(id).exec();
    }
    async findOne(filter) {
        return this.model.findOne(filter).exec();
    }
    async find(filter = {}) {
        return this.model.find(filter).exec();
    }
    async update(id, update) {
        return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    }
    async delete(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
}
