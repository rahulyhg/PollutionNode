
module.exports = {
    save: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standings.save(req.body, callback);
    },
    delete: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standings.delete(req.body, callback);
    },
    find: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standings.find(req.body, callback);
    },
    findlimited: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standings.findlimited(req.body, callback);
    },
    findone: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Standings.findone(req.body, callback);
    }
};