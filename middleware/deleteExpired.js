const deleteExpired = Model => {
    return async(req, res, next) => {
        let today = new Date();

        let expired = await Model.find({ expiresAt: { $lt: today } });

        if (expired.length !== 0) {
            expired.forEach(async (elem) => {
                await Model.findByIdAndDelete(elem._id);
            });
        }

        console.log(expired.length)

        next();
    }
}

module.exports = deleteExpired;