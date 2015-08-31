
module.exports = {
    save: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        DailyPost.save(req.body, callback);
    },
    delete: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        DailyPost.delete(req.body, callback);
    },
    find: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        DailyPost.find(req.body, callback);
    },
    findlimited: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        DailyPost.findlimited(req.body, callback);
    },
    findone: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        DailyPost.findone(req.body, callback);
    }
};