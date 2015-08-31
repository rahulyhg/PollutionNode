
module.exports = {
    save: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Gallery.save(req.body, callback);
    },
    delete: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Gallery.delete(req.body, callback);
    },
    find: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Gallery.find(req.body, callback);
    },
    findlimited: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Gallery.findlimited(req.body, callback);
    },
    findone: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Gallery.findone(req.body, callback);
    }
};