const SubSchema = require('../models/Subs/Sub');
const HotelSchema = require('../models/Hotels/Hotel');

const deleteExpired = Model => {
    return async(req, res, next) => {
        let modelInstance;
        switch(Model) {
            case 'Sub':
                modelInstance = req.db.model('Sub', SubSchema);
                break;
            case 'Hotel':
                modelInstance = req.db.model('Hotel', HotelSchema);
                break;
            default:
                next();
        }

        let today = new Date();

        let expired = await modelInstance.find({ expiresAt: { $lt: today } });

        if (expired.length !== 0) {
            for (const elem of expired) {
                await modelInstance.findByIdAndDelete(elem._id);
            }
        }

        next();
    }
}

module.exports = deleteExpired;