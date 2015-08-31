
module.exports = {
    save: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Post.save(req.body, callback);
    },
    delete: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Post.delete(req.body, callback);
    },
    find: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Post.find(req.body, callback);
    },
    findlimited: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Post.findlimited(req.body, callback);
    },
    findone: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Post.findone(req.body, callback);
    }
};