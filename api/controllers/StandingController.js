
module.exports = {
    save: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standing.save(req.body, callback);
    },
    delete: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standing.delete(req.body, callback);
    },
    find: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standing.find(req.body, callback);
    },
    findlimited: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standing.findlimited(req.body, callback);
    },
    findone: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standing.findone(req.body, callback);
    }
};