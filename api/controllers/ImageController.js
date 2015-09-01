module.exports = {
    save: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        Image.save(req.body, print);
    },
    find: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        Image.find(req.body, print);
    },
    findlimited: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        Image.findlimited(req.body, print);
    },
    findone: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        Image.findone(req.body, print);
    },
    delete: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        Image.delete(req.body, print);
    }
};